// =============================================================================
// KantaSwara — Email Renderer
// =============================================================================
// Renders React Email components to HTML + plain text.

import { render } from '@react-email/render';
import { createElement } from 'react';
import { getTemplateEntry } from './templateRegistry';
import type { RenderedEmail } from './types';

export class TemplateNotFoundError extends Error {
  constructor(templateKey: string) {
    super(
      `[EmailRenderer] Template "${templateKey}" not found in registry. ` +
        `Register it in server/lib/email/templateRegistry.ts`
    );
    this.name = 'TemplateNotFoundError';
  }
}

/**
 * Replaces {{variable}} placeholders in the subject line.
 */
export function interpolateSubject(
  subject: string,
  variables: Record<string, unknown>
): string {
  return subject.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = variables[key];
    return value != null ? String(value) : '';
  });
}

/**
 * Renders a template to { html, text, subject }.
 */
export async function renderTemplate(
  templateKey: string,
  variables: Record<string, unknown> = {}
): Promise<RenderedEmail> {
  const entry = getTemplateEntry(templateKey);
  if (!entry) {
    throw new TemplateNotFoundError(templateKey);
  }

  // Lazy-load the React component
  const module = await entry.component();
  const Component = module.default;

  if (!Component) {
    throw new Error(
      `[EmailRenderer] Template "${templateKey}" does not have a default export.`
    );
  }

  // Augment variables with standard globals
  const allVars: Record<string, unknown> = {
    currentYear: new Date().getFullYear(),
    appName: process.env.NEXT_PUBLIC_APP_NAME ?? 'KantaSwara',
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    supportEmail:
      process.env.RESEND_REPLY_TO ?? 'support@kantaswara.com',
    ...variables,
  };

  // Render to HTML
  const element = createElement(
    Component as React.ComponentType<Record<string, unknown>>,
    allVars
  );
  const html = await render(element);
  const text = await render(element, { plainText: true });
  const subject = interpolateSubject(entry.subject, allVars);

  return { html, text, subject };
}
