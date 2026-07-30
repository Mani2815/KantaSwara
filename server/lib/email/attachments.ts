// =============================================================================
// KantaSwara — Email Attachment Manager
// =============================================================================

import type { EmailAttachment } from './types';

const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10MB per file
const MAX_TOTAL_SIZE_BYTES = 40 * 1024 * 1024; // 40MB total

const BLOCKED_CONTENT_TYPES = [
  'application/x-msdownload',
  'application/x-sh',
  'application/x-bat',
  'text/x-script',
];

export class AttachmentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AttachmentValidationError';
  }
}

export class AttachmentManager {
  /**
   * Validates and prepares attachments for the email provider.
   */
  static validate(attachments: EmailAttachment[]): void {
    let totalSize = 0;

    for (const attachment of attachments) {
      if (!attachment.filename) {
        throw new AttachmentValidationError('Attachment must have a filename');
      }

      const content = attachment.content;
      const size =
        typeof content === 'string'
          ? Buffer.byteLength(content, 'base64')
          : content.length;

      if (size > MAX_ATTACHMENT_SIZE_BYTES) {
        throw new AttachmentValidationError(
          `Attachment "${attachment.filename}" exceeds 10MB limit (${(size / 1024 / 1024).toFixed(2)}MB)`
        );
      }

      totalSize += size;
      if (totalSize > MAX_TOTAL_SIZE_BYTES) {
        throw new AttachmentValidationError(
          'Total attachment size exceeds 40MB limit'
        );
      }

      if (
        attachment.contentType &&
        BLOCKED_CONTENT_TYPES.includes(attachment.contentType)
      ) {
        throw new AttachmentValidationError(
          `Content type "${attachment.contentType}" is not allowed`
        );
      }
    }
  }

  /**
   * Converts a Buffer to a base64 string for sending.
   */
  static encodeBuffer(buffer: Buffer): string {
    return buffer.toString('base64');
  }
}
