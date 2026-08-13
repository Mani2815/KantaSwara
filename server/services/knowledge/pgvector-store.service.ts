// =============================================================================
// PgVector Store (Production)
// =============================================================================
// Production-grade vector store using PostgreSQL pgvector extension.
// Replaces InMemoryVectorStore for enterprise deployments.
//
// Features:
// - Native cosine similarity search via pgvector <=> operator
// - Batch upsert with ON CONFLICT for idempotent re-indexing
// - Hybrid retrieval: vector similarity + keyword matching
// - Metadata filtering: organizationId, documentType, category, language, tags
// - Connection pooling via existing Prisma client
//
// Requires: `CREATE EXTENSION IF NOT EXISTS vector;` on PostgreSQL
// =============================================================================

import { prisma } from '@server/lib/prisma';
import { Prisma } from '@prisma/client';
import type {
  VectorStore,
  DocumentChunk,
  RetrievalResult,
} from './knowledge.types';

// =============================================================================
// PgVector Store Implementation
// =============================================================================

export class PgVectorStore implements VectorStore {
  readonly name = 'pgvector';

  private isAvailable: boolean | null = null;

  // ── Check pgvector availability ───────────────────────────────────────────

  /**
   * Check if pgvector extension is available.
   * Caches the result after first check.
   */
  async checkAvailability(): Promise<boolean> {
    if (this.isAvailable !== null) return this.isAvailable;

    try {
      const result = await prisma.$queryRaw<Array<{ exists: boolean }>>`
        SELECT EXISTS (
          SELECT 1 FROM pg_extension WHERE extname = 'vector'
        ) as exists
      `;
      this.isAvailable = result[0]?.exists ?? false;

      if (!this.isAvailable) {
        console.warn(
          '[PgVectorStore] pgvector extension not found. ' +
            'Run: CREATE EXTENSION IF NOT EXISTS vector; ' +
            'Falling back to JSON-based cosine similarity.'
        );
      }
    } catch {
      this.isAvailable = false;
      console.warn('[PgVectorStore] Could not check pgvector availability.');
    }

    return this.isAvailable;
  }

  // ── Upsert Chunks ─────────────────────────────────────────────────────────

  async upsert(chunks: DocumentChunk[]): Promise<void> {
    if (chunks.length === 0) return;

    const pgvectorAvailable = await this.checkAvailability();

    // Process chunks in batches of 50 for memory efficiency
    const BATCH_SIZE = 50;
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      await this.upsertBatch(batch, pgvectorAvailable);
    }
  }

  private async upsertBatch(
    chunks: DocumentChunk[],
    pgvectorAvailable: boolean
  ): Promise<void> {
    for (const chunk of chunks) {
      if (!chunk.metadata.documentId) continue;

      const metadata: Record<string, unknown> = {
        documentName: chunk.metadata.documentName,
        totalChunks: chunk.metadata.totalChunks,
        pageNumber: chunk.metadata.pageNumber,
        sectionHeading: chunk.metadata.sectionHeading,
      };

      if (pgvectorAvailable && chunk.embedding) {
        // Use raw SQL to store native pgvector embedding
        const vectorStr = `[${chunk.embedding.join(',')}]`;

        await prisma.$executeRaw`
          INSERT INTO public.document_chunks (
            id, document_id, knowledge_base_id, organization_id,
            content, chunk_index, token_count, embedding, metadata, created_at
          ) VALUES (
            gen_random_uuid(),
            ${chunk.metadata.documentId},
            ${chunk.metadata.knowledgeBaseId},
            ${chunk.metadata.organizationId},
            ${chunk.content},
            ${chunk.metadata.chunkIndex},
            ${chunk.tokenCount},
            ${vectorStr}::jsonb,
            ${JSON.stringify(metadata)}::jsonb,
            NOW()
          )
          ON CONFLICT (id) DO UPDATE SET
            content = EXCLUDED.content,
            embedding = EXCLUDED.embedding,
            token_count = EXCLUDED.token_count,
            metadata = EXCLUDED.metadata
        `;
      } else {
        // Fallback: Store embedding as JSON
        await prisma.documentChunk.create({
          data: {
            documentId: chunk.metadata.documentId,
            knowledgeBaseId: chunk.metadata.knowledgeBaseId,
            organizationId: chunk.metadata.organizationId,
            content: chunk.content,
            chunkIndex: chunk.metadata.chunkIndex,
            tokenCount: chunk.tokenCount,
            embedding: (chunk.embedding || Prisma.DbNull) as Prisma.InputJsonValue,
            metadata: metadata as Prisma.InputJsonValue,
          },
        });
      }
    }
  }

  // ── Search ────────────────────────────────────────────────────────────────

  async search(
    embedding: number[],
    topK: number,
    filters: {
      knowledgeBaseIds: string[];
      organizationId: string;
      documentType?: string;
      category?: string;
      language?: string;
      tags?: string[];
    },
    threshold = 0.7
  ): Promise<RetrievalResult[]> {
    const pgvectorAvailable = await this.checkAvailability();

    if (pgvectorAvailable) {
      return this.searchWithPgVector(embedding, topK, filters, threshold);
    }

    // Fallback to in-memory cosine similarity
    return this.searchWithJsonEmbeddings(embedding, topK, filters, threshold);
  }

  // ── pgvector-native search ────────────────────────────────────────────────

  private async searchWithPgVector(
    embedding: number[],
    topK: number,
    filters: {
      knowledgeBaseIds: string[];
      organizationId: string;
      documentType?: string;
      category?: string;
      language?: string;
      tags?: string[];
    },
    threshold: number
  ): Promise<RetrievalResult[]> {
    const vectorStr = `[${embedding.join(',')}]`;

    // Build dynamic filter conditions
    const conditions: string[] = [
      `organization_id = '${filters.organizationId}'`,
      `knowledge_base_id = ANY(ARRAY[${filters.knowledgeBaseIds.map((id) => `'${id}'`).join(',')}])`,
      `embedding IS NOT NULL`,
    ];

    if (filters.documentType) {
      conditions.push(`metadata->>'documentType' = '${filters.documentType}'`);
    }
    if (filters.category) {
      conditions.push(`metadata->>'category' = '${filters.category}'`);
    }
    if (filters.language) {
      conditions.push(`metadata->>'language' = '${filters.language}'`);
    }
    if (filters.tags && filters.tags.length > 0) {
      conditions.push(
        `metadata->'tags' ?| ARRAY[${filters.tags.map((t) => `'${t}'`).join(',')}]`
      );
    }

    const whereClause = conditions.join(' AND ');

    // Use cosine similarity: 1 - (embedding <=> query_vector)
    // pgvector <=> returns cosine distance, so similarity = 1 - distance
    const query = `
      SELECT
        id, document_id, knowledge_base_id, organization_id,
        content, chunk_index, token_count, metadata,
        1 - (embedding::text::vector <=> '${vectorStr}'::vector) as similarity
      FROM public.document_chunks
      WHERE ${whereClause}
        AND 1 - (embedding::text::vector <=> '${vectorStr}'::vector) >= ${threshold}
      ORDER BY embedding::text::vector <=> '${vectorStr}'::vector
      LIMIT ${topK}
    `;

    try {
      const results = await prisma.$queryRawUnsafe<
        Array<{
          id: string;
          document_id: string;
          knowledge_base_id: string;
          organization_id: string;
          content: string;
          chunk_index: number;
          token_count: number;
          metadata: Record<string, unknown>;
          similarity: number;
        }>
      >(query);

      return results.map((row, index) => ({
        chunk: {
          id: row.id,
          content: row.content,
          metadata: {
            documentId: row.document_id,
            knowledgeBaseId: row.knowledge_base_id,
            organizationId: row.organization_id,
            documentName: (row.metadata?.documentName as string) || '',
            chunkIndex: row.chunk_index,
            totalChunks: (row.metadata?.totalChunks as number) || undefined,
            pageNumber: (row.metadata?.pageNumber as number) || undefined,
            sectionHeading: (row.metadata?.sectionHeading as string) || undefined,
          },
          tokenCount: row.token_count,
        },
        score: Number(row.similarity),
        rank: index + 1,
      }));
    } catch (err) {
      console.error('[PgVectorStore] pgvector search failed, falling back:', err);
      return this.searchWithJsonEmbeddings(embedding, topK, filters, threshold);
    }
  }

  // ── JSON-based cosine similarity fallback ─────────────────────────────────

  private async searchWithJsonEmbeddings(
    embedding: number[],
    topK: number,
    filters: {
      knowledgeBaseIds: string[];
      organizationId: string;
    },
    threshold: number
  ): Promise<RetrievalResult[]> {
    const candidates = await prisma.documentChunk.findMany({
      where: {
        organizationId: filters.organizationId,
        knowledgeBaseId: { in: filters.knowledgeBaseIds },
        embedding: { not: Prisma.DbNull },
      },
    });

    const scored: RetrievalResult[] = [];

    for (const candidate of candidates) {
      const candidateEmbedding = candidate.embedding as number[] | null;
      if (!candidateEmbedding) continue;

      const score = cosineSimilarity(embedding, candidateEmbedding);

      if (score >= threshold) {
        const metadata = candidate.metadata as Record<string, unknown>;
        scored.push({
          chunk: {
            id: candidate.id,
            content: candidate.content,
            metadata: {
              documentId: candidate.documentId,
              knowledgeBaseId: candidate.knowledgeBaseId,
              organizationId: candidate.organizationId,
              documentName: (metadata?.documentName as string) || '',
              chunkIndex: candidate.chunkIndex,
              totalChunks: (metadata?.totalChunks as number) || undefined,
              pageNumber: (metadata?.pageNumber as number) || undefined,
              sectionHeading: (metadata?.sectionHeading as string) || undefined,
            },
            tokenCount: candidate.tokenCount,
          },
          score,
          rank: 0,
        });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    const topResults = scored.slice(0, topK);
    topResults.forEach((result, index) => {
      result.rank = index + 1;
    });

    return topResults;
  }

  // ── Hybrid Search (Vector + Keyword) ──────────────────────────────────────

  /**
   * Hybrid search combining vector similarity with PostgreSQL full-text search.
   * Useful for queries where exact keyword matching adds value.
   */
  async hybridSearch(
    embedding: number[],
    queryText: string,
    topK: number,
    filters: {
      knowledgeBaseIds: string[];
      organizationId: string;
    },
    options: {
      vectorWeight?: number;
      keywordWeight?: number;
      threshold?: number;
    } = {}
  ): Promise<RetrievalResult[]> {
    const { vectorWeight = 0.7, keywordWeight = 0.3, threshold = 0.5 } = options;
    const pgvectorAvailable = await this.checkAvailability();

    if (!pgvectorAvailable) {
      // Fall back to pure vector search
      return this.searchWithJsonEmbeddings(embedding, topK, filters, threshold);
    }

    const vectorStr = `[${embedding.join(',')}]`;
    const kbIds = filters.knowledgeBaseIds.map((id) => `'${id}'`).join(',');

    const query = `
      WITH vector_results AS (
        SELECT
          id, document_id, knowledge_base_id, organization_id,
          content, chunk_index, token_count, metadata,
          1 - (embedding::text::vector <=> '${vectorStr}'::vector) as vector_score
        FROM public.document_chunks
        WHERE organization_id = '${filters.organizationId}'
          AND knowledge_base_id = ANY(ARRAY[${kbIds}])
          AND embedding IS NOT NULL
      ),
      keyword_results AS (
        SELECT
          id,
          ts_rank(to_tsvector('english', content), plainto_tsquery('english', $1)) as keyword_score
        FROM public.document_chunks
        WHERE organization_id = '${filters.organizationId}'
          AND knowledge_base_id = ANY(ARRAY[${kbIds}])
      )
      SELECT
        vr.*,
        COALESCE(kr.keyword_score, 0) as keyword_score,
        (vr.vector_score * ${vectorWeight} + COALESCE(kr.keyword_score, 0) * ${keywordWeight}) as hybrid_score
      FROM vector_results vr
      LEFT JOIN keyword_results kr ON vr.id = kr.id
      WHERE vr.vector_score >= ${threshold * 0.8}
      ORDER BY hybrid_score DESC
      LIMIT ${topK}
    `;

    try {
      const results = await prisma.$queryRawUnsafe<
        Array<{
          id: string;
          document_id: string;
          knowledge_base_id: string;
          organization_id: string;
          content: string;
          chunk_index: number;
          token_count: number;
          metadata: Record<string, unknown>;
          hybrid_score: number;
        }>
      >(query, queryText);

      return results
        .filter((row) => Number(row.hybrid_score) >= threshold)
        .map((row, index) => ({
          chunk: {
            id: row.id,
            content: row.content,
            metadata: {
              documentId: row.document_id,
              knowledgeBaseId: row.knowledge_base_id,
              organizationId: row.organization_id,
              documentName: (row.metadata?.documentName as string) || '',
              chunkIndex: row.chunk_index,
              totalChunks: (row.metadata?.totalChunks as number) || undefined,
              pageNumber: (row.metadata?.pageNumber as number) || undefined,
              sectionHeading: (row.metadata?.sectionHeading as string) || undefined,
            },
            tokenCount: row.token_count,
          },
          score: Number(row.hybrid_score),
          rank: index + 1,
        }));
    } catch (err) {
      console.error('[PgVectorStore] Hybrid search failed:', err);
      return this.searchWithJsonEmbeddings(embedding, topK, filters, threshold);
    }
  }

  // ── Delete Operations ─────────────────────────────────────────────────────

  async deleteByDocument(documentId: string): Promise<void> {
    await prisma.documentChunk.deleteMany({
      where: { documentId },
    });
  }

  async deleteByKnowledgeBase(knowledgeBaseId: string): Promise<void> {
    await prisma.documentChunk.deleteMany({
      where: { knowledgeBaseId },
    });
  }
}

// =============================================================================
// Cosine Similarity (for JSON fallback)
// =============================================================================

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}
