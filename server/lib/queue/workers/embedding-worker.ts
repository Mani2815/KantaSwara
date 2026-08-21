// =============================================================================
// Embedding Worker
// =============================================================================
// Processes document indexing jobs from the embeddings queue.
// Calls the knowledge service to parse, chunk, embed, and store documents.
// =============================================================================

import { createWorker, QUEUE_NAMES } from '../queue';

/**
 * Start the embedding worker.
 * Processes document indexing jobs asynchronously.
 */
export function startEmbeddingWorker() {
  const worker = createWorker(
    QUEUE_NAMES.EMBEDDINGS,
    async (job) => {
      const { documentId, organizationId, knowledgeBaseId, fileName } = job.data as {
        documentId: string;
        organizationId: string;
        knowledgeBaseId: string;
        fileName: string;
      };

      console.log(
        `[EmbeddingWorker] Processing document "${fileName}" (${documentId}) for org ${organizationId}`
      );

      // Dynamic import to avoid circular dependencies at module load
      const { indexDocument } = await import(
        '@server/services/knowledge/knowledge.service'
      );

      await indexDocument(documentId);

      console.log(
        `[EmbeddingWorker] Document "${fileName}" indexed successfully`
      );

      return { documentId, status: 'indexed' };
    },
    { concurrency: 2 } // Limit concurrent embeddings to avoid API rate limits
  );

  console.log('[EmbeddingWorker] Started');
  return worker;
}
