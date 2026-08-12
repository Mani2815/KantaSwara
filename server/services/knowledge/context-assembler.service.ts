// =============================================================================
// Context Assembler
// =============================================================================
// Assembles retrieved knowledge chunks into a formatted context string
// suitable for injection into the LLM prompt.
// Token-budget-aware: truncates to fit within the allocated budget.
// =============================================================================

import type { RetrievalResult } from './knowledge.types';

// =============================================================================
// ASSEMBLE KNOWLEDGE CONTEXT
// =============================================================================

/**
 * Format retrieved knowledge chunks into a context string for the prompt.
 * Chunks are included in relevance order until the token budget is reached.
 *
 * @param results - Retrieved chunks with relevance scores
 * @param tokenBudget - Maximum tokens to allocate for knowledge context
 * @returns Formatted context string, or undefined if no results
 */
export function assembleKnowledgeContext(
  results: RetrievalResult[],
  tokenBudget = 1024
): string | undefined {
  if (results.length === 0) return undefined;

  const CHARS_PER_TOKEN = 4;
  const charBudget = tokenBudget * CHARS_PER_TOKEN;

  const sections: string[] = [];
  let totalChars = 0;

  for (const result of results) {
    const section = formatChunkSection(result);
    const sectionChars = section.length;

    // Check if adding this section exceeds budget
    if (totalChars + sectionChars > charBudget) {
      // Try to include a truncated version
      const remaining = charBudget - totalChars;
      if (remaining > 100) {
        // Only include if we can fit a meaningful amount
        const truncated = section.slice(0, remaining - 20) + '\n[...truncated]';
        sections.push(truncated);
      }
      break;
    }

    sections.push(section);
    totalChars += sectionChars;
  }

  if (sections.length === 0) return undefined;

  return sections.join('\n\n---\n\n');
}

// ── Format a single chunk ───────────────────────────────────────────────────

function formatChunkSection(result: RetrievalResult): string {
  const { chunk, score } = result;
  const { metadata } = chunk;

  // Build source attribution
  const source = metadata.documentName || 'Unknown Document';
  const location = metadata.pageNumber
    ? ` (Page ${metadata.pageNumber})`
    : metadata.sectionHeading
      ? ` — ${metadata.sectionHeading}`
      : '';

  const header = `[Source: ${source}${location} | Relevance: ${(score * 100).toFixed(0)}%]`;

  return `${header}\n${chunk.content}`;
}

// =============================================================================
// FORMAT FOR DISPLAY
// =============================================================================

/**
 * Format retrieval results for display/logging (not for prompt injection).
 * Includes full metadata and scores.
 */
export function formatResultsForDisplay(results: RetrievalResult[]): string {
  if (results.length === 0) return 'No relevant documents found.';

  return results
    .map((r) => {
      const { chunk, score, rank } = r;
      return [
        `#${rank} (${(score * 100).toFixed(1)}% match)`,
        `  Document: ${chunk.metadata.documentName}`,
        `  Chunk: ${chunk.metadata.chunkIndex + 1}/${chunk.metadata.totalChunks || '?'}`,
        `  Preview: ${chunk.content.slice(0, 100)}...`,
      ].join('\n');
    })
    .join('\n\n');
}
