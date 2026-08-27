import { getRegisteredProviders, getLLMProvider, getSTTProvider, getTTSProvider } from '../runtime/provider-registry.service';
import { handleHttpError } from './errors';

async function testOpenAIKey(apiKey: string): Promise<void> {
  const res = await fetch('https://api.openai.com/v1/models', {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) handleHttpError('openai', res.status, await res.text());
}

async function testGroqKey(apiKey: string): Promise<void> {
  const res = await fetch('https://api.groq.com/openai/v1/models', {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) handleHttpError('groq', res.status, await res.text());
}

async function testDeepgramKey(apiKey: string): Promise<void> {
  const res = await fetch('https://api.deepgram.com/v1/projects', {
    headers: { Authorization: `Token ${apiKey}` },
  });
  if (!res.ok) handleHttpError('deepgram', res.status, await res.text());
}

async function testElevenLabsKey(apiKey: string): Promise<void> {
  const res = await fetch('https://api.elevenlabs.io/v1/models', {
    headers: { 'xi-api-key': apiKey },
  });
  if (!res.ok) handleHttpError('elevenlabs', res.status, await res.text());
}

export async function validateProviderCredentials(): Promise<void> {
  console.log('🔍 Validating AI Provider Credentials...');
  let hasErrors = false;

  const validate = async (name: string, checkFn: (key: string) => Promise<void>, envVar: string) => {
    try {
      const key = process.env[envVar];
      if (!key) throw new Error(`Missing ${envVar}`);
      await checkFn(key);
      console.log(`✅ Provider "${name}" is configured correctly.`);
    } catch (err) {
      console.error(`❌ Provider "${name}" configuration error:`, err instanceof Error ? err.message : err);
      hasErrors = true;
    }
  };

  await Promise.allSettled([
    validate('openai (LLM)', testOpenAIKey, 'OPENAI_API_KEY'),
    validate('groq (LLM)', testGroqKey, 'GROQ_API_KEY'),
    validate('deepgram (STT/TTS)', testDeepgramKey, 'DEEPGRAM_API_KEY'),
    validate('elevenlabs (TTS)', testElevenLabsKey, 'ELEVENLABS_API_KEY'),
  ]);

  if (hasErrors) {
    console.error('\n⚠️ One or more AI providers are misconfigured. Please check your API keys in .env.local.');
  } else {
    console.log('✅ All AI Provider credentials validated successfully.\n');
  }
}
