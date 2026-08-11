// =============================================================================
// Chunking Service
// =============================================================================
// Splits document text into overlapping chunks suitable for embedding.
// Preserves paragraph boundaries when possible.
// Configurable chunk size, overlap, and minimum size.
// =============================================================================

import type { DocumentChunk, ChunkMetadata, ChunkingOptions } from './knowledge.types';

// ── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_CHUNK_SIZE = 512;       // tokens
const DEFAULT_CHUNK_OVERLAP = 50;     // tokens
const DEFAULT_MIN_CHUNK_SIZE = 50;    // tokens
const CHARS_PER_TOKEN = 4;            // rough approximation

// =============================================================================
// CHUNK TEXT
// =============================================================================

/**
 * Split text into overlapping chunks with metadata.
 *
 * Strategy:
 * 1. Split text into paragraphs (double newline boundaries)
 * 2. Group paragraphs into chunks that fit within chunkSize
 * 3. Add overlap from the end of the previous chunk
 * 4. Ensure no chunk is below minChunkSize (merge with previous)
 */
export function chunkText(
  text: string,
  metadata: Omit<ChunkMetadata, 'chunkIndex' | 'totalChunks'>,
  options: ChunkingOptions = {}
): DocumentChunk[] {
  const {
    chunkSize = DEFAULT_CHUNK_SIZE,
    chunkOverlap = DEFAULT_CHUNK_OVERLAP,
    minChunkSize = DEFAULT_MIN_CHUNK_SIZE,
    preserveParagraphs = true,
  } = options;

  const chunkSizeChars = chunkSize * CHARS_PER_TOKEN;
  const overlapChars = chunkOverlap * CHARS_PER_TOKEN;
  const minChunkChars = minChunkSize * CHARS_PER_TOKEN;

  // Clean the text
  const cleanedText = text.replace(/\r\n/g, '\n').trim();

  if (!cleanedText) return [];

  // If text fits in one chunk, return it directly
  if (cleanedText.length <= chunkSizeChars) {
    return [
      {
        content: cleanedText,
        metadata: { ...metadata, chunkIndex: 0, totalChunks: 1 },
        tokenCount: estimateTokens(cleanedText),
      },
    ];
  }

  let rawChunks: string[];

  if (preserveParagraphs) {
    rawChunks = chunkByParagraphs(cleanedText, chunkSizeChars, overlapChars);
  } else {
    rawChunks = chunkBySentences(cleanedText, chunkSizeChars, overlapChars);
  }

  // Filter out empty chunks and merge tiny ones
  const mergedChunks = mergeTinyChunks(rawChunks, minChunkChars);

  // Build DocumentChunk objects
  const totalChunks = mergedChunks.length;
  return mergedChunks.map((content, index) => ({
    content: content.trim(),
    metadata: {
      ...metadata,
      chunkIndex: index,
      totalChunks,
    },
    tokenCount: estimateTokens(content),
  }));
}

// ── Paragraph-based chunking ────────────────────────────────────────────────

function chunkByParagraphs(
  text: string,
  chunkSizeChars: number,
  overlapChars: number
): string[] {
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    const candidate = currentChunk
      ? `${currentChunk}\n\n${paragraph}`
      : paragraph;

    if (candidate.length > chunkSizeChars && currentChunk.length > 0) {
      // Current chunk is full — save it
      chunks.push(currentChunk);

      // Start new chunk with overlap from the end of previous chunk
      const overlap = getOverlapText(currentChunk, overlapChars);
      currentChunk = overlap ? `${overlap}\n\n${paragraph}` : paragraph;
    } else if (paragraph.length > chunkSizeChars) {
      // Single paragraph exceeds chunk size — split by sentences
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      const sentenceChunks = chunkBySentences(paragraph, chunkSizeChars, overlapChars);
      chunks.push(...sentenceChunks.slice(0, -1));
      currentChunk = sentenceChunks[sentenceChunks.length - 1] || '';
    } else {
      currentChunk = candidate;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk);
  }

  return chunks;
}

// ── Sentence-based chunking ─────────────────────────────────────────────────

function chunkBySentences(
  text: string,
  chunkSizeChars: number,
  overlapChars: number
): string[] {
  // Split on sentence boundaries
  const sentences = text.match(/[^.!?]+[.!?]+\s*|[^.!?]+$/g) || [text];
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    const candidate = currentChunk ? `${currentChunk}${sentence}` : sentence;

    if (candidate.length > chunkSizeChars && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());

      // Start new chunk with overlap
      const overlap = getOverlapText(currentChunk, overlapChars);
      currentChunk = overlap ? `${overlap}${sentence}` : sentence;
    } else {
      currentChunk = candidate;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

// ── Overlap extraction ──────────────────────────────────────────────────────

function getOverlapText(text: string, overlapChars: number): string {
  if (overlapChars <= 0 || text.length <= overlapChars) return '';

  // Get the last `overlapChars` characters, but try to start at a sentence boundary
  const overlapRegion = text.slice(-overlapChars);
  const sentenceBoundary = overlapRegion.search(/[.!?]\s+/);

  if (sentenceBoundary > 0) {
    // Start overlap at the beginning of a sentence
    return overlapRegion.slice(sentenceBoundary + 1).trim();
  }

  return overlapRegion.trim();
}

// ── Merge tiny chunks ───────────────────────────────────────────────────────

function mergeTinyChunks(chunks: string[], minChunkChars: number): string[] {
  if (chunks.length <= 1) return chunks;

  const merged: string[] = [];

  for (const chunk of chunks) {
    if (
      merged.length > 0 &&
      chunk.length < minChunkChars
    ) {
      // Merge with previous chunk
      merged[merged.length - 1] += `\n\n${chunk}`;
    } else {
      merged.push(chunk);
    }
  }

  return merged;
}

// ── Token estimation ────────────────────────────────────────────────────────

function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}
