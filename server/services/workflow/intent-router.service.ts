// =============================================================================
// Intent Router Service
// =============================================================================
// Uses LLM to classify user intent against workflow-defined intent mappings.
// Returns matched intent + confidence score.
// Falls back to keyword matching when LLM is unavailable.
// =============================================================================

import type { IntentMapping } from './workflow.types';
import type { LLMProvider, LLMMessage } from '../providers/types';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface IntentResult {
  intent: string;
  targetNodeId: string;
  confidence: number;
  matched: boolean;
}

// =============================================================================
// ROUTE INTENT (LLM-based)
// =============================================================================

/**
 * Use LLM to classify user intent against available intent mappings.
 * Falls back to keyword matching if LLM fails.
 */
export async function routeIntent(
  userInput: string,
  intents: IntentMapping[],
  llmProvider: LLMProvider,
  options?: { model?: string; temperature?: number }
): Promise<IntentResult> {
  if (intents.length === 0) {
    return { intent: 'none', targetNodeId: '', confidence: 0, matched: false };
  }

  try {
    const result = await classifyWithLLM(userInput, intents, llmProvider, options);
    if (result.matched) return result;
  } catch (err) {
    console.error('[IntentRouter] LLM classification failed, using keyword fallback:', err);
  }

  // Fallback to keyword matching
  return classifyWithKeywords(userInput, intents);
}

// =============================================================================
// LLM-BASED CLASSIFICATION
// =============================================================================

async function classifyWithLLM(
  userInput: string,
  intents: IntentMapping[],
  llmProvider: LLMProvider,
  options?: { model?: string; temperature?: number }
): Promise<IntentResult> {
  const intentDescriptions = intents
    .map((i, idx) => `${idx + 1}. "${i.intent}" — ${i.description}`)
    .join('\n');

  const systemPrompt = `You are an intent classification system. Classify the user's message into one of the following intents. Respond ONLY with a JSON object containing "intent" (the intent name) and "confidence" (0.0 to 1.0).

Available intents:
${intentDescriptions}

If none of the intents match, respond with {"intent": "none", "confidence": 0.0}.

IMPORTANT: Respond with ONLY the JSON object, no other text.`;

  const messages: LLMMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userInput },
  ];

  const response = await llmProvider.complete(messages, {
    model: options?.model,
    temperature: options?.temperature || 0.1,
    maxTokens: 100,
  });

  // Parse LLM response
  try {
    const cleanedText = response.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanedText);
    const matchedIntent = intents.find((i) => i.intent === parsed.intent);

    if (matchedIntent && parsed.confidence > 0.5) {
      return {
        intent: matchedIntent.intent,
        targetNodeId: matchedIntent.targetNodeId,
        confidence: parsed.confidence,
        matched: true,
      };
    }
  } catch {
    // JSON parsing failed — fall through to keyword matching
  }

  return { intent: 'none', targetNodeId: '', confidence: 0, matched: false };
}

// =============================================================================
// KEYWORD-BASED CLASSIFICATION (Fallback)
// =============================================================================

function classifyWithKeywords(
  userInput: string,
  intents: IntentMapping[]
): IntentResult {
  const input = userInput.toLowerCase().trim();
  let bestMatch: IntentResult = {
    intent: 'none',
    targetNodeId: '',
    confidence: 0,
    matched: false,
  };

  for (const intent of intents) {
    let matchScore = 0;
    let matchCount = 0;

    for (const example of intent.examples) {
      const exLower = example.toLowerCase().trim();

      // Exact match
      if (input === exLower) {
        matchScore = 1.0;
        matchCount++;
        break;
      }

      // Contains match
      if (input.includes(exLower) || exLower.includes(input)) {
        const overlap = Math.min(input.length, exLower.length) / Math.max(input.length, exLower.length);
        matchScore = Math.max(matchScore, overlap * 0.8);
        matchCount++;
      }

      // Word overlap
      const inputWords = input.split(/\s+/);
      const exampleWords = exLower.split(/\s+/);
      const commonWords = inputWords.filter((w) => exampleWords.includes(w));
      if (commonWords.length > 0) {
        const wordScore = commonWords.length / Math.max(inputWords.length, exampleWords.length);
        matchScore = Math.max(matchScore, wordScore * 0.6);
        matchCount++;
      }
    }

    if (matchScore > bestMatch.confidence) {
      bestMatch = {
        intent: intent.intent,
        targetNodeId: intent.targetNodeId,
        confidence: matchScore,
        matched: matchScore > 0.3,
      };
    }
  }

  return bestMatch;
}
