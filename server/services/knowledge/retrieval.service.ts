// =============================================================================
// Retrieval Service
// =============================================================================
// Vector search abstraction for knowledge retrieval.
// Provides a VectorStore interface with an in-memory implementation
// as placeholder. Future: PgVectorStore for Supabase pgvector.
// Organization-scoped search ensures no cross-tenant access.
// =============================================================================

import { prisma } from '@server/lib/prisma';
import { Prisma } from '@prisma/client';
import type {
  VectorStore,
  DocumentChunk,
  RetrievalResult,
} from './knowledge.types';

// =============================================================================
// In-Memory Vector Store (Placeholder)
// =============================================================================

/**
 * In-memory vector store using cosine similarity.
 * This is a development placeholder — use PgVectorStore in production.
 * Stores embeddings in Prisma DocumentChunk model as JSON.
 */
export class InMemoryVectorStore implements VectorStore {
  readonly name = 'in-memory';

  async upsert(chunks: DocumentChunk[]): Promise<void> {
    for (const chunk of chunks) {
      if (!chunk.metadata.documentId) continue;

      await prisma.documentChunk.create({
        data: {
          documentId: chunk.metadata.documentId,
          knowledgeBaseId: chunk.metadata.knowledgeBaseId,
          organizationId: chunk.metadata.organizationId,
          content: chunk.content,
          chunkIndex: chunk.metadata.chunkIndex,
          tokenCount: chunk.tokenCount,
          embedding: (chunk.embedding || Prisma.DbNull) as Prisma.InputJsonValue,
          metadata: {
            documentName: chunk.metadata.documentName,
            totalChunks: chunk.metadata.totalChunks,
            pageNumber: chunk.metadata.pageNumber,
            sectionHeading: chunk.metadata.sectionHeading,
          },
        },
      });
    }
  }

  async search(
    embedding: number[],
    topK: number,
    filters: {
      knowledgeBaseIds: string[];
      organizationId: string;
    },
    threshold = 0.7
  ): Promise<RetrievalResult[]> {
    // Load candidate chunks from DB
    const candidates = await prisma.documentChunk.findMany({
      where: {
        organizationId: filters.organizationId,
        knowledgeBaseId: { in: filters.knowledgeBaseIds },
        embedding: { not: Prisma.DbNull },
      },
    });

    // Calculate cosine similarity for each candidate
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
            embedding: candidateEmbedding,
          },
          score,
          rank: 0, // Will be set after sorting
        });
      }
    }

    // Sort by score descending, take topK
    scored.sort((a, b) => b.score - a.score);
    const topResults = scored.slice(0, topK);

    // Assign ranks
    topResults.forEach((result, index) => {
      result.rank = index + 1;
    });

    return topResults;
  }

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
// Cosine Similarity
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

// =============================================================================
// Vector Store Registry
// =============================================================================

let defaultStore: VectorStore | null = null;

/**
 * Get the default vector store instance.
 * Uses PgVectorStore in production (with automatic fallback to JSON-based
 * cosine similarity when pgvector extension is unavailable).
 * Use setVectorStore() to override (e.g., InMemoryVectorStore for tests).
 */
export function getVectorStore(): VectorStore {
  if (!defaultStore) {
    // Production default: PgVectorStore (auto-detects pgvector availability)
    const { PgVectorStore } = require('./pgvector-store.service');
    defaultStore = new PgVectorStore();
  }
  return defaultStore!;
}

/**
 * Set a custom vector store (e.g., PgVectorStore for production).
 */
export function setVectorStore(store: VectorStore): void {
  defaultStore = store;
}
