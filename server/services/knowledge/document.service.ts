// =============================================================================
// Document Service
// =============================================================================
// Handles document ingestion: parsing text from various file formats.
// Supports: TXT, Markdown, HTML (strip tags), PDF (interface for future).
// Uses existing Prisma KnowledgeDocument model for persistence.
// =============================================================================

import { prisma } from '@server/lib/prisma';
import type { DocumentMetadata, SupportedMimeType } from './knowledge.types';
import { SUPPORTED_MIME_TYPES } from './knowledge.types';

// =============================================================================
// PARSE DOCUMENT
// =============================================================================

/**
 * Extract text content from a document buffer based on its MIME type.
 */
export function parseDocument(
  buffer: Buffer,
  mimeType: string
): { text: string; pageCount?: number } {
  // Normalize MIME type
  const normalizedMime = mimeType.split(';')[0].trim().toLowerCase();

  switch (normalizedMime) {
    case 'text/plain':
      return parsePlainText(buffer);

    case 'text/markdown':
      return parseMarkdown(buffer);

    case 'text/html':
      return parseHTML(buffer);

    case 'application/pdf':
      return parsePDF(buffer);

    default:
      throw new DocumentError(
        'UNSUPPORTED_FORMAT',
        `Unsupported document format: ${mimeType}. Supported: ${SUPPORTED_MIME_TYPES.join(', ')}`,
        400
      );
  }
}

// ── Plain Text ──────────────────────────────────────────────────────────────

function parsePlainText(buffer: Buffer): { text: string } {
  return { text: buffer.toString('utf-8') };
}

// ── Markdown ────────────────────────────────────────────────────────────────

function parseMarkdown(buffer: Buffer): { text: string } {
  // Markdown is already text — keep it as-is for chunking
  // The chunker will handle paragraph boundaries
  return { text: buffer.toString('utf-8') };
}

// ── HTML ────────────────────────────────────────────────────────────────────

function parseHTML(buffer: Buffer): { text: string } {
  const html = buffer.toString('utf-8');

  // Strip HTML tags, keeping text content
  let text = html
    // Remove script and style blocks entirely
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Replace block-level elements with newlines
    .replace(/<\/?(p|div|br|h[1-6]|li|tr|td|th|blockquote|pre|hr)[^>]*>/gi, '\n')
    // Remove all remaining HTML tags
    .replace(/<[^>]+>/g, '')
    // Decode common HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    // Normalize whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return { text };
}

// ── PDF (Placeholder) ───────────────────────────────────────────────────────

function parsePDF(_buffer: Buffer): { text: string; pageCount?: number } {
  // PDF parsing requires a library like pdf-parse or pdfjs-dist
  // This is a placeholder that will be implemented when a PDF library
  // is added to the project dependencies.
  console.warn(
    '[DocumentService] PDF parsing is not yet implemented. ' +
    'Add a PDF parsing library (e.g., pdf-parse) to enable this feature.'
  );

  return {
    text: '[PDF content extraction pending — library integration required]',
    pageCount: undefined,
  };
}

// =============================================================================
// CHECK MIME TYPE SUPPORT
// =============================================================================

export function isSupportedMimeType(mimeType: string): mimeType is SupportedMimeType {
  const normalized = mimeType.split(';')[0].trim().toLowerCase();
  return (SUPPORTED_MIME_TYPES as readonly string[]).includes(normalized);
}

// =============================================================================
// GET DOCUMENT METADATA
// =============================================================================

/**
 * Load document metadata from the database.
 */
export async function getDocumentMetadata(
  documentId: string
): Promise<DocumentMetadata | null> {
  const doc = await prisma.knowledgeDocument.findUnique({
    where: { id: documentId },
  });

  if (!doc) return null;

  return {
    documentId: doc.id,
    knowledgeBaseId: doc.knowledgeBaseId,
    organizationId: doc.organizationId,
    name: doc.name,
    mimeType: doc.mimeType,
    sizeBytes: Number(doc.sizeBytes),
    custom: (doc.metadata as Record<string, unknown>) || {},
  };
}

// =============================================================================
// UPDATE DOCUMENT STATUS
// =============================================================================

export async function updateDocumentStatus(
  documentId: string,
  status: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const updateData: Record<string, unknown> = { status };

  if (metadata) {
    const existing = await prisma.knowledgeDocument.findUnique({
      where: { id: documentId },
      select: { metadata: true },
    });
    updateData.metadata = {
      ...((existing?.metadata as Record<string, unknown>) || {}),
      ...metadata,
    };
  }

  await prisma.knowledgeDocument.update({
    where: { id: documentId },
    data: updateData,
  });
}

// =============================================================================
// Document Error
// =============================================================================

export class DocumentError extends Error {
  code: string;
  statusCode: number;

  constructor(code: string, message: string, statusCode = 500) {
    super(message);
    this.name = 'DocumentError';
    this.code = code;
    this.statusCode = statusCode;
  }
}
