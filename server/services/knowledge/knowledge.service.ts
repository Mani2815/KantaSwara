// =============================================================================
// Knowledge Service (Orchestrator)
// =============================================================================
// High-level knowledge operations that coordinate the full pipeline:
//   Document → Parse → Chunk → Embed → Store → Retrieve → Context
//
// Uses existing KnowledgeBase and KnowledgeDocument Prisma models.
// =============================================================================

import { prisma } from '@server/lib/prisma';
import type { KnowledgeQuery, RetrievalResult } from './knowledge.types';
import { parseDocument, getDocumentMetadata, updateDocumentStatus } from './document.service';
import { chunkText } from './chunking.service';
import { getEmbeddingProvider } from './embedding.service';
import { getVectorStore } from './retrieval.service';
import { assembleKnowledgeContext } from './context-assembler.service';

// =============================================================================
// QUERY KNOWLEDGE
// =============================================================================

/**
 * Query knowledge bases and return formatted context for prompt injection.
 * This is the primary entry point used by the Voice Runtime.
 *
 * @param query - The user's question / search text
 * @param knowledgeBaseIds - Knowledge bases to search within
 * @param organizationId - Organization ID for tenant isolation
 * @param tokenBudget - Max tokens to allocate for knowledge context
 * @returns Formatted context string, or undefined if no relevant results
 */
export async function queryKnowledge(
  query: string,
  knowledgeBaseIds: string[],
  organizationId: string,
  tokenBudget = 1024
): Promise<string | undefined> {
  if (knowledgeBaseIds.length === 0) return undefined;

  try {
    // Step 1: Embed the query
    const embeddingProvider = getEmbeddingProvider();
    const queryEmbedding = await embeddingProvider.embed(query);

    // Step 2: Search the vector store
    const vectorStore = getVectorStore();
    const results = await vectorStore.search(
      queryEmbedding.vector,
      5, // topK
      { knowledgeBaseIds, organizationId },
      0.7 // threshold
    );

    if (results.length === 0) return undefined;

    // Step 3: Assemble into context string
    return assembleKnowledgeContext(results, tokenBudget);
  } catch (err) {
    console.error('[KnowledgeService] Query failed:', err);
    return undefined; // Non-fatal — agent responds without knowledge context
  }
}

// =============================================================================
// INDEX DOCUMENT
// =============================================================================

/**
 * Process a document through the full indexing pipeline:
 * Parse → Chunk → Embed → Store in vector store.
 *
 * @param documentId - ID of the KnowledgeDocument to index
 * @param content - Raw document content as Buffer (if already loaded)
 */
export async function indexDocument(
  documentId: string,
  content?: Buffer
): Promise<{ chunksCreated: number; success: boolean }> {
  const metadata = await getDocumentMetadata(documentId);
  if (!metadata) {
    throw new KnowledgeError('DOCUMENT_NOT_FOUND', 'Document not found.', 404);
  }

  try {
    // Step 1: Update status
    await updateDocumentStatus(documentId, 'processing');

    // Step 2: Parse document (if content not provided, this would need storage retrieval)
    if (!content) {
      // In production, fetch from object storage using metadata.storageKey
      console.warn(
        '[KnowledgeService] No content buffer provided. ' +
          'Document storage retrieval not yet implemented.'
      );
      await updateDocumentStatus(documentId, 'failed', {
        error: 'Content buffer not provided',
      });
      return { chunksCreated: 0, success: false };
    }

    const parsed = parseDocument(content, metadata.mimeType);
    if (!parsed.text.trim()) {
      await updateDocumentStatus(documentId, 'failed', {
        error: 'No text content extracted',
      });
      return { chunksCreated: 0, success: false };
    }

    // Step 3: Chunk
    await updateDocumentStatus(documentId, 'chunking');
    const chunks = chunkText(parsed.text, {
      documentId: metadata.documentId,
      knowledgeBaseId: metadata.knowledgeBaseId,
      organizationId: metadata.organizationId,
      documentName: metadata.name,
    });

    if (chunks.length === 0) {
      await updateDocumentStatus(documentId, 'failed', {
        error: 'No chunks produced',
      });
      return { chunksCreated: 0, success: false };
    }

    // Step 4: Embed
    await updateDocumentStatus(documentId, 'embedding');
    const embeddingProvider = getEmbeddingProvider();
    const texts = chunks.map((c) => c.content);
    const embeddings = await embeddingProvider.embedBatch(texts);

    // Attach embeddings to chunks
    for (let i = 0; i < chunks.length; i++) {
      chunks[i].embedding = embeddings[i]?.vector;
    }

    // Step 5: Store in vector store
    const vectorStore = getVectorStore();

    // Delete any existing chunks for this document first
    await vectorStore.deleteByDocument(documentId);

    // Store new chunks
    await vectorStore.upsert(chunks);

    // Step 6: Update status
    await updateDocumentStatus(documentId, 'indexed', {
      chunksCount: chunks.length,
      indexedAt: new Date().toISOString(),
      pageCount: parsed.pageCount,
    });

    // Update knowledge base document count
    await updateKnowledgeBaseStats(metadata.knowledgeBaseId);

    console.log(
      `[KnowledgeService] Indexed document "${metadata.name}": ${chunks.length} chunks`
    );

    return { chunksCreated: chunks.length, success: true };
  } catch (err) {
    console.error(`[KnowledgeService] Indexing failed for ${documentId}:`, err);
    await updateDocumentStatus(documentId, 'failed', {
      error: err instanceof Error ? err.message : 'Unknown error',
    });
    return { chunksCreated: 0, success: false };
  }
}

// =============================================================================
// DELETE DOCUMENT INDEX
// =============================================================================

/**
 * Remove all indexed chunks for a document.
 */
export async function deleteDocumentIndex(documentId: string): Promise<void> {
  const vectorStore = getVectorStore();
  await vectorStore.deleteByDocument(documentId);
  await updateDocumentStatus(documentId, 'pending', {
    indexedAt: null,
    chunksCount: 0,
  });
}

// =============================================================================
// SEARCH KNOWLEDGE (raw results)
// =============================================================================

/**
 * Search knowledge bases and return raw retrieval results.
 * Use queryKnowledge() for prompt-ready context instead.
 */
export async function searchKnowledge(
  query: KnowledgeQuery
): Promise<RetrievalResult[]> {
  const embeddingProvider = getEmbeddingProvider();
  const queryEmbedding = await embeddingProvider.embed(query.queryText);

  const vectorStore = getVectorStore();
  return vectorStore.search(
    queryEmbedding.vector,
    query.topK || 5,
    {
      knowledgeBaseIds: query.knowledgeBaseIds,
      organizationId: query.organizationId,
    },
    query.threshold || 0.7
  );
}

// =============================================================================
// HELPERS
// =============================================================================

async function updateKnowledgeBaseStats(knowledgeBaseId: string): Promise<void> {
  try {
    const docCount = await prisma.knowledgeDocument.count({
      where: {
        knowledgeBaseId,
        status: 'indexed',
        deletedAt: null,
      },
    });

    await prisma.knowledgeBase.update({
      where: { id: knowledgeBaseId },
      data: { documentCount: docCount },
    });
  } catch {
    // Non-fatal
  }
}

// =============================================================================
// Knowledge Error
// =============================================================================

export class KnowledgeError extends Error {
  code: string;
  statusCode: number;

  constructor(code: string, message: string, statusCode = 500) {
    super(message);
    this.name = 'KnowledgeError';
    this.code = code;
    this.statusCode = statusCode;
  }
}
