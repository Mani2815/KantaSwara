// =============================================================================
// Knowledge Engine — Type Definitions
// =============================================================================
// Shared types for the knowledge engine: documents, chunks, embeddings,
// retrieval, and context assembly.
// =============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// Supported Document Types
// ─────────────────────────────────────────────────────────────────────────────

export const SUPPORTED_MIME_TYPES = [
  'text/plain',
  'text/markdown',
  'text/html',
  'application/pdf',
] as const;

export const FUTURE_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  'text/csv',
] as const;

export type SupportedMimeType = (typeof SUPPORTED_MIME_TYPES)[number];

// ─────────────────────────────────────────────────────────────────────────────
// Document Metadata
// ─────────────────────────────────────────────────────────────────────────────

export interface DocumentMetadata {
  documentId: string;
  knowledgeBaseId: string;
  organizationId: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  source?: string;
  pageCount?: number;
  language?: string;
  custom?: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Document Chunk
// ─────────────────────────────────────────────────────────────────────────────

export interface DocumentChunk {
  id?: string;
  /** The text content of this chunk */
  content: string;
  /** Source document metadata */
  metadata: ChunkMetadata;
  /** Embedding vector (populated by embedding service) */
  embedding?: number[];
  /** Estimated token count of the content */
  tokenCount: number;
}

export interface ChunkMetadata {
  documentId: string;
  knowledgeBaseId: string;
  organizationId: string;
  /** Source document name */
  documentName: string;
  /** Zero-based chunk index within the document */
  chunkIndex: number;
  /** Total number of chunks in the document */
  totalChunks?: number;
  /** Page number (for PDF/DOCX) */
  pageNumber?: number;
  /** Section heading (if detected) */
  sectionHeading?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Chunking Options
// ─────────────────────────────────────────────────────────────────────────────

export interface ChunkingOptions {
  /** Target chunk size in tokens (default: 512) */
  chunkSize?: number;
  /** Overlap between chunks in tokens (default: 50) */
  chunkOverlap?: number;
  /** Minimum chunk size in tokens — don't create tiny chunks (default: 50) */
  minChunkSize?: number;
  /** Whether to preserve paragraph boundaries (default: true) */
  preserveParagraphs?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Embedding Types
// ─────────────────────────────────────────────────────────────────────────────

export interface EmbeddingResult {
  /** The embedding vector */
  vector: number[];
  /** The model used to generate the embedding */
  model: string;
  /** Dimensions of the embedding vector */
  dimensions: number;
  /** Token count of the input text */
  tokenCount?: number;
}

export interface EmbeddingProvider {
  readonly name: string;
  readonly dimensions: number;

  /** Generate an embedding for a single text */
  embed(text: string): Promise<EmbeddingResult>;

  /** Generate embeddings for multiple texts (batch) */
  embedBatch(texts: string[]): Promise<EmbeddingResult[]>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Knowledge Query & Retrieval
// ─────────────────────────────────────────────────────────────────────────────

export interface KnowledgeQuery {
  /** The query text to search for */
  queryText: string;
  /** Knowledge base IDs to search within */
  knowledgeBaseIds: string[];
  /** Organization ID (for tenant isolation) */
  organizationId: string;
  /** Number of top results to return (default: 5) */
  topK?: number;
  /** Minimum relevance score threshold (0-1, default: 0.7) */
  threshold?: number;
}

export interface RetrievalResult {
  /** The matched chunk */
  chunk: DocumentChunk;
  /** Relevance/similarity score (0-1) */
  score: number;
  /** Rank in the result set (1-based) */
  rank: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Vector Store Interface
// ─────────────────────────────────────────────────────────────────────────────

export interface VectorStore {
  readonly name: string;

  /** Store chunks with their embeddings */
  upsert(chunks: DocumentChunk[]): Promise<void>;

  /** Search for similar chunks */
  search(
    embedding: number[],
    topK: number,
    filters: {
      knowledgeBaseIds: string[];
      organizationId: string;
    },
    threshold?: number
  ): Promise<RetrievalResult[]>;

  /** Delete all chunks for a document */
  deleteByDocument(documentId: string): Promise<void>;

  /** Delete all chunks for a knowledge base */
  deleteByKnowledgeBase(knowledgeBaseId: string): Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Document Processing Status
// ─────────────────────────────────────────────────────────────────────────────

export type DocumentProcessingStatus =
  | 'pending'
  | 'processing'
  | 'chunking'
  | 'embedding'
  | 'indexed'
  | 'failed';
