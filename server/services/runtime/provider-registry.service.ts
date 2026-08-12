// =============================================================================
// Provider Registry
// =============================================================================
// Dynamic provider resolution replacing hardcoded singleton pattern.
// Register and resolve STT, LLM, and TTS providers by name.
// Future providers plug in without changing downstream code.
// =============================================================================

import type {
  STTProvider,
  LLMProvider,
  TTSProvider,
} from '../providers/types';

import { OpenAIWhisperSTTProvider } from '../providers/stt/openai-whisper.provider';
import { OpenAILLMProvider } from '../providers/llm/openai.provider';
import { OpenAITTSProvider } from '../providers/tts/openai-tts.provider';

// ── Provider Factories ──────────────────────────────────────────────────────

type STTFactory = (apiKey?: string) => STTProvider;
type LLMFactory = (apiKey?: string) => LLMProvider;
type TTSFactory = (apiKey?: string) => TTSProvider;

// ── Registries ──────────────────────────────────────────────────────────────

const sttRegistry = new Map<string, STTFactory>();
const llmRegistry = new Map<string, LLMFactory>();
const ttsRegistry = new Map<string, TTSFactory>();

// ── Instance Caches (singletons per provider name) ──────────────────────────

const sttInstances = new Map<string, STTProvider>();
const llmInstances = new Map<string, LLMProvider>();
const ttsInstances = new Map<string, TTSProvider>();

// ── Registration ────────────────────────────────────────────────────────────

export function registerSTTProvider(name: string, factory: STTFactory): void {
  sttRegistry.set(name, factory);
}

export function registerLLMProvider(name: string, factory: LLMFactory): void {
  llmRegistry.set(name, factory);
}

export function registerTTSProvider(name: string, factory: TTSFactory): void {
  ttsRegistry.set(name, factory);
}

// ── Resolution ──────────────────────────────────────────────────────────────

/**
 * Get or create an STT provider instance by name.
 * Instances are cached as singletons.
 */
export function getSTTProvider(name: string, apiKey?: string): STTProvider {
  let instance = sttInstances.get(name);
  if (instance) return instance;

  const factory = sttRegistry.get(name);
  if (!factory) {
    throw new Error(`[ProviderRegistry] STT provider "${name}" not registered. Available: ${Array.from(sttRegistry.keys()).join(', ')}`);
  }

  instance = factory(apiKey);
  sttInstances.set(name, instance);
  return instance;
}

/**
 * Get or create an LLM provider instance by name.
 * Instances are cached as singletons.
 */
export function getLLMProvider(name: string, apiKey?: string): LLMProvider {
  let instance = llmInstances.get(name);
  if (instance) return instance;

  const factory = llmRegistry.get(name);
  if (!factory) {
    throw new Error(`[ProviderRegistry] LLM provider "${name}" not registered. Available: ${Array.from(llmRegistry.keys()).join(', ')}`);
  }

  instance = factory(apiKey);
  llmInstances.set(name, instance);
  return instance;
}

/**
 * Get or create a TTS provider instance by name.
 * Instances are cached as singletons.
 */
export function getTTSProvider(name: string, apiKey?: string): TTSProvider {
  let instance = ttsInstances.get(name);
  if (instance) return instance;

  const factory = ttsRegistry.get(name);
  if (!factory) {
    throw new Error(`[ProviderRegistry] TTS provider "${name}" not registered. Available: ${Array.from(ttsRegistry.keys()).join(', ')}`);
  }

  instance = factory(apiKey);
  ttsInstances.set(name, instance);
  return instance;
}

// ── Introspection ───────────────────────────────────────────────────────────

export function getRegisteredProviders(): {
  stt: string[];
  llm: string[];
  tts: string[];
} {
  return {
    stt: Array.from(sttRegistry.keys()),
    llm: Array.from(llmRegistry.keys()),
    tts: Array.from(ttsRegistry.keys()),
  };
}

/**
 * Clear all cached provider instances. Useful for testing.
 */
export function clearProviderCache(): void {
  sttInstances.clear();
  llmInstances.clear();
  ttsInstances.clear();
}

// ── Default Registrations ───────────────────────────────────────────────────
// Register the existing OpenAI providers on module load.
// Future providers register themselves or are registered at startup.

registerSTTProvider('openai-whisper', (apiKey) => new OpenAIWhisperSTTProvider(apiKey));
registerLLMProvider('openai', (apiKey) => new OpenAILLMProvider(apiKey));
registerTTSProvider('openai-tts', (apiKey) => new OpenAITTSProvider(apiKey));
