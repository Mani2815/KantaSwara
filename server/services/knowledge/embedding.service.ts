// =============================================================================
// Embedding Service
// =============================================================================
// Abstraction layer for text embeddings. Provides an EmbeddingProvider
// interface with an OpenAI implementation using text-embedding-3-small.
// Future providers (Cohere, local models, etc.) plug in via the interface.
// =============================================================================

import type { EmbeddingProvider, EmbeddingResult } from './knowledge.types';

// =============================================================================
// OpenAI Embedding Provider
// =============================================================================

export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  readonly name = 'openai';
  readonly dimensions = 1536; // text-embedding-3-small default

  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(options?: { apiKey?: string; model?: string }) {
    this.apiKey = options?.apiKey || process.env.OPENAI_API_KEY || '';
    this.baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
    this.model = options?.model || 'text-embedding-3-small';

    if (!this.apiKey) {
      console.warn('[OpenAIEmbeddingProvider] No API key. Set OPENAI_API_KEY.');
    }
  }

  async embed(text: string): Promise<EmbeddingResult> {
    const response = await fetch(`${this.baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        input: text,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI Embeddings API error (${response.status}): ${error}`);
    }

    const data = await response.json();
    const embedding = data.data?.[0]?.embedding;

    if (!embedding) {
      throw new Error('No embedding returned from OpenAI API');
    }

    return {
      vector: embedding,
      model: this.model,
      dimensions: embedding.length,
      tokenCount: data.usage?.total_tokens,
    };
  }

  async embedBatch(texts: string[]): Promise<EmbeddingResult[]> {
    if (texts.length === 0) return [];

    // OpenAI supports batch embedding in a single request
    const response = await fetch(`${this.baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        input: texts,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI Embeddings API error (${response.status}): ${error}`);
    }

    const data = await response.json();
    const embeddings = data.data as Array<{ embedding: number[]; index: number }>;

    if (!embeddings || embeddings.length === 0) {
      throw new Error('No embeddings returned from OpenAI API');
    }

    // Sort by index to match input order
    embeddings.sort((a, b) => a.index - b.index);

    return embeddings.map((e) => ({
      vector: e.embedding,
      model: this.model,
      dimensions: e.embedding.length,
    }));
  }
}

// =============================================================================
// Embedding Provider Registry
// =============================================================================

const embeddingProviders = new Map<string, EmbeddingProvider>();

/**
 * Register an embedding provider.
 */
export function registerEmbeddingProvider(
  name: string,
  provider: EmbeddingProvider
): void {
  embeddingProviders.set(name, provider);
}

/**
 * Get an embedding provider by name.
 */
export function getEmbeddingProvider(name = 'openai'): EmbeddingProvider {
  let provider = embeddingProviders.get(name);

  if (!provider) {
    // Auto-register OpenAI if requested and not yet registered
    if (name === 'openai') {
      provider = new OpenAIEmbeddingProvider();
      embeddingProviders.set(name, provider);
    } else {
      throw new Error(
        `[EmbeddingService] Provider "${name}" not registered. Available: ${Array.from(embeddingProviders.keys()).join(', ')}`
      );
    }
  }

  return provider;
}
