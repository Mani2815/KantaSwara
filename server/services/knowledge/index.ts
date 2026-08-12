// =============================================================================
// Knowledge Engine — Barrel Exports
// =============================================================================

// ── Types ───────────────────────────────────────────────────────────────────
export type {
  DocumentMetadata,
  DocumentChunk,
  ChunkMetadata,
  ChunkingOptions,
  EmbeddingResult,
  EmbeddingProvider,
  KnowledgeQuery,
  RetrievalResult,
  VectorStore,
  DocumentProcessingStatus,
  SupportedMimeType,
} from './knowledge.types';

export { SUPPORTED_MIME_TYPES, FUTURE_MIME_TYPES } from './knowledge.types';

// ── Document Service ────────────────────────────────────────────────────────
export {
  parseDocument,
  isSupportedMimeType,
  getDocumentMetadata,
  updateDocumentStatus,
  DocumentError,
} from './document.service';

// ── Chunking Service ────────────────────────────────────────────────────────
export { chunkText } from './chunking.service';

// ── Embedding Service ───────────────────────────────────────────────────────
export {
  OpenAIEmbeddingProvider,
  registerEmbeddingProvider,
  getEmbeddingProvider,
} from './embedding.service';

// ── Retrieval Service ───────────────────────────────────────────────────────
export {
  InMemoryVectorStore,
  getVectorStore,
  setVectorStore,
} from './retrieval.service';

// ── Context Assembler ───────────────────────────────────────────────────────
export {
  assembleKnowledgeContext,
  formatResultsForDisplay,
} from './context-assembler.service';

// ── Knowledge Service (Orchestrator) ────────────────────────────────────────
export {
  queryKnowledge,
  indexDocument,
  deleteDocumentIndex,
  searchKnowledge,
  KnowledgeError,
} from './knowledge.service';
