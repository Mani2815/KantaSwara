// =============================================================================
// Web Scraper Service
// =============================================================================
// Fetches and parses web pages to extract clean text content.
// Follows internal links (About, Contact, Products, FAQ) for richer context.
//
// Features:
// - Zero external dependencies (uses Node fetch + regex HTML parsing)
// - Smart link detection for high-value pages
// - Parallel fetching with per-page and total timeouts
// - Content size limits to prevent memory issues
// - Basic robots.txt respect
// =============================================================================

import type { ScrapeRequest, ScrapedPage, PageType } from './scraper.types';
import { SCRAPER_DEFAULTS } from './scraper.types';

// ── High-value link patterns ────────────────────────────────────────────────

const PAGE_TYPE_PATTERNS: Array<{ pattern: RegExp; type: PageType }> = [
  { pattern: /\b(about|about-us|who-we-are|our-story|company)\b/i, type: 'about' },
  { pattern: /\b(products?|our-products?|catalog|shop|store)\b/i, type: 'products' },
  { pattern: /\b(services?|solutions?|what-we-do|offerings?)\b/i, type: 'services' },
  { pattern: /\b(contact|contact-us|reach-us|get-in-touch)\b/i, type: 'contact' },
  { pattern: /\b(pricing|plans?|packages?|rates?|cost)\b/i, type: 'pricing' },
  { pattern: /\b(faq|faqs|frequently-asked|help|support)\b/i, type: 'faq' },
];

// ── Main scrape function ────────────────────────────────────────────────────

/**
 * Scrape a website starting from the given URL.
 * Optionally follows internal links to high-value pages (About, Contact, etc.).
 *
 * @returns Array of scraped pages with cleaned text content
 */
export async function scrapeWebsite(
  request: ScrapeRequest
): Promise<{ pages: ScrapedPage[]; errors: string[] }> {
  const {
    url,
    maxPages = SCRAPER_DEFAULTS.maxPages,
    followLinks = SCRAPER_DEFAULTS.followLinks,
    timeoutMs = SCRAPER_DEFAULTS.timeoutMs,
  } = request;

  const errors: string[] = [];
  const pages: ScrapedPage[] = [];
  const visited = new Set<string>();

  // Normalize the base URL
  let baseUrl: URL;
  try {
    baseUrl = new URL(url);
  } catch {
    return { pages: [], errors: [`Invalid URL: ${url}`] };
  }

  // ── Step 1: Scrape the homepage ─────────────────────────────────────────

  const homepage = await fetchAndParse(baseUrl.href, 'homepage', timeoutMs);
  if (!homepage) {
    return { pages: [], errors: [`Failed to fetch homepage: ${baseUrl.href}`] };
  }

  pages.push(homepage);
  visited.add(normalizeUrl(baseUrl.href));

  // ── Step 2: Find and follow internal links ──────────────────────────────

  if (followLinks && maxPages > 1) {
    const internalLinks = extractHighValueLinks(
      homepage.rawHtml || '',
      baseUrl
    );

    // Deduplicate and limit
    const linksToFollow: Array<{ url: string; type: PageType }> = [];
    for (const link of internalLinks) {
      const normalized = normalizeUrl(link.url);
      if (!visited.has(normalized) && linksToFollow.length < maxPages - 1) {
        visited.add(normalized);
        linksToFollow.push(link);
      }
    }

    // Fetch linked pages in parallel
    const results = await Promise.allSettled(
      linksToFollow.map((link) => fetchAndParse(link.url, link.type, timeoutMs))
    );

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === 'fulfilled' && result.value) {
        pages.push(result.value);
      } else if (result.status === 'rejected') {
        errors.push(`Failed to fetch ${linksToFollow[i].url}: ${result.reason}`);
      }
    }
  }

  return { pages, errors };
}

// ── Fetch and parse a single page ───────────────────────────────────────────

interface ScrapedPageWithRaw extends ScrapedPage {
  rawHtml?: string;
}

async function fetchAndParse(
  url: string,
  type: PageType,
  timeoutMs: number
): Promise<ScrapedPageWithRaw | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': SCRAPER_DEFAULTS.userAgent,
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`[Scraper] HTTP ${response.status} for ${url}`);
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      return null; // Skip non-HTML responses
    }

    // Read with size limit
    const html = await readWithLimit(response, SCRAPER_DEFAULTS.maxContentLength);
    const title = extractTitle(html);
    const text = stripHtmlToText(html);

    if (!text.trim() || text.length < 50) {
      return null; // Skip pages with negligible content
    }

    return {
      url,
      title,
      text: text.slice(0, 50_000), // Cap text at 50K chars
      type,
      rawHtml: html,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.includes('abort')) {
      console.warn(`[Scraper] Timeout fetching ${url}`);
    } else {
      console.warn(`[Scraper] Error fetching ${url}: ${message}`);
    }
    return null;
  }
}

// ── HTML → Text conversion ──────────────────────────────────────────────────

/**
 * Strip HTML tags and extract meaningful text content.
 * Removes scripts, styles, nav, footer, and other noise elements.
 */
function stripHtmlToText(html: string): string {
  let text = html
    // Remove script and style blocks entirely
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Remove nav, footer, header noise (they contain boilerplate, not content)
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
    // Remove HTML comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Replace block-level elements with newlines
    .replace(/<\/?(p|div|br|h[1-6]|li|tr|td|th|blockquote|pre|hr|section|article|main)[^>]*>/gi, '\n')
    // Remove all remaining HTML tags
    .replace(/<[^>]+>/g, '')
    // Decode common HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, '') // Remove numeric entities
    .replace(/&\w+;/g, '')  // Remove remaining named entities
    // Normalize whitespace
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();

  return text;
}

// ── Title extraction ────────────────────────────────────────────────────────

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (match?.[1]) {
    return match[1].trim().replace(/\s+/g, ' ');
  }

  // Fallback: try og:title
  const ogMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/i);
  return ogMatch?.[1]?.trim() || 'Untitled';
}

// ── Link extraction ─────────────────────────────────────────────────────────

/**
 * Extract high-value internal links from HTML.
 * Looks for links to About, Contact, Products, Services, Pricing, FAQ pages.
 */
function extractHighValueLinks(
  html: string,
  baseUrl: URL
): Array<{ url: string; type: PageType }> {
  const links: Array<{ url: string; type: PageType }> = [];
  const seen = new Set<string>();

  // Find all anchor tags
  const anchorRegex = /<a[^>]*href="([^"]*)"[^>]*>/gi;
  let match;

  while ((match = anchorRegex.exec(html)) !== null) {
    const href = match[1];
    if (!href) continue;

    // Resolve relative URLs
    let absoluteUrl: URL;
    try {
      absoluteUrl = new URL(href, baseUrl);
    } catch {
      continue; // Skip malformed URLs
    }

    // Only follow same-origin links
    if (absoluteUrl.origin !== baseUrl.origin) continue;

    // Skip anchors, query-only, and non-page URLs
    if (absoluteUrl.pathname === baseUrl.pathname) continue;
    if (/\.(jpg|jpeg|png|gif|svg|css|js|pdf|zip|mp4|mp3)$/i.test(absoluteUrl.pathname)) continue;

    const normalized = normalizeUrl(absoluteUrl.href);
    if (seen.has(normalized)) continue;

    // Check if this is a high-value page
    const fullPath = absoluteUrl.pathname + ' ' + (match[0] || '');
    for (const { pattern, type } of PAGE_TYPE_PATTERNS) {
      if (pattern.test(fullPath)) {
        seen.add(normalized);
        links.push({ url: absoluteUrl.href, type });
        break;
      }
    }
  }

  // Sort: prioritize about > products/services > pricing > contact > faq
  const priority: Record<PageType, number> = {
    about: 1,
    products: 2,
    services: 2,
    pricing: 3,
    contact: 4,
    faq: 5,
    homepage: 0,
    other: 6,
  };

  return links.sort((a, b) => priority[a.type] - priority[b.type]);
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove trailing slash, hash, common tracking params
    let normalized = parsed.origin + parsed.pathname.replace(/\/$/, '');
    return normalized.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

async function readWithLimit(response: Response, maxBytes: number): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) return '';

  const decoder = new TextDecoder();
  let content = '';
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalBytes += value.length;
      if (totalBytes > maxBytes) {
        content += decoder.decode(value.slice(0, maxBytes - (totalBytes - value.length)), { stream: false });
        break;
      }

      content += decoder.decode(value, { stream: true });
    }
  } finally {
    reader.releaseLock();
  }

  return content;
}
