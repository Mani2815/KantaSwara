// =============================================================================
// Web Scraper Types
// =============================================================================
// Type definitions for the web scraping + context extraction pipeline.
// Used during agent creation to auto-extract business context from a URL.
// =============================================================================

// ── Input Types ─────────────────────────────────────────────────────────────

export interface ScrapeRequest {
  /** The website URL to scrape */
  url: string;
  /** Maximum number of pages to follow and scrape (default: 5) */
  maxPages?: number;
  /** Whether to follow internal links like About, Contact, etc. (default: true) */
  followLinks?: boolean;
  /** Timeout per page in ms (default: 10_000) */
  timeoutMs?: number;
}

// ── Scraped Data ────────────────────────────────────────────────────────────

export interface ScrapedPage {
  /** The URL that was scraped */
  url: string;
  /** Page title extracted from <title> tag */
  title: string;
  /** Cleaned text content (HTML stripped) */
  text: string;
  /** Detected page type based on URL/content heuristics */
  type: PageType;
}

export type PageType =
  | 'homepage'
  | 'about'
  | 'products'
  | 'services'
  | 'contact'
  | 'pricing'
  | 'faq'
  | 'other';

// ── Extracted Context ───────────────────────────────────────────────────────

export interface ExtractedBusinessContext {
  /** Company/business name */
  companyName: string;
  /** Industry or business domain */
  industry: string;
  /** Brief description of the business */
  description: string;
  /** Products or services offered */
  products: Array<{
    name: string;
    description: string;
    price?: string;
  }>;
  /** Contact information found on the site */
  contactInfo: {
    phone?: string;
    email?: string;
    address?: string;
    website?: string;
  };
  /** Frequently asked questions found on the site */
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  /** Key selling points / value propositions */
  keySellingPoints: string[];
  /** Detected tone of voice (e.g., "professional", "friendly", "corporate") */
  toneOfVoice: string;

  // ── Generated outputs ───────────────────────────────────────────────────

  /** AI-generated system prompt tailored to this business */
  suggestedSystemPrompt: string;
  /** AI-generated greeting for voice agent */
  suggestedGreeting: string;
  /** Consolidated knowledge summary for the knowledge base */
  knowledgeSummary: string;
}

// ── Result ──────────────────────────────────────────────────────────────────

export interface ScrapeResult {
  /** Overall status of the scraping operation */
  status: 'success' | 'partial' | 'failed';
  /** Number of pages successfully scraped */
  pagesScraped: number;
  /** Total time taken in ms */
  durationMs: number;
  /** Extracted business context (null if scraping failed entirely) */
  context: ExtractedBusinessContext | null;
  /** Errors encountered during scraping */
  errors?: string[];
  /** Raw scraped pages (for debugging / preview) */
  pages?: ScrapedPage[];
}

// ── Constants ───────────────────────────────────────────────────────────────

export const SCRAPER_DEFAULTS = {
  maxPages: 5,
  followLinks: true,
  timeoutMs: 10_000,
  totalTimeoutMs: 30_000,
  maxContentLength: 500_000, // 500KB per page
  userAgent: 'KantaSwara-Agent-Builder/1.0 (context-extraction)',
} as const;
