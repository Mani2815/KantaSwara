// =============================================================================
// POST /api/v1/scraper/extract — Web Scraping + Context Extraction
// =============================================================================
// Accepts a website URL, scrapes it, and uses an LLM to extract structured
// business context for agent creation.
//
// Request:  { url: string, maxPages?: number }
// Response: ScrapeResult with extracted context, suggested prompt, and greeting
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { scrapeWebsite } from '@server/services/scraper/web-scraper.service';
import { extractBusinessContext } from '@server/services/scraper/context-extractor.service';
import type { ScrapeResult } from '@server/services/scraper/scraper.types';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { url, maxPages } = body;

    // ── Validation ──────────────────────────────────────────────────────

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { code: 'MISSING_PARAMS', message: 'url is required.' },
        { status: 400 }
      );
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch {
      return NextResponse.json(
        { code: 'INVALID_URL', message: 'Please provide a valid HTTP/HTTPS URL.' },
        { status: 400 }
      );
    }

    // Block localhost/private IPs (basic SSRF prevention)
    const hostname = parsedUrl.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.')
    ) {
      return NextResponse.json(
        { code: 'BLOCKED_URL', message: 'Private/localhost URLs are not allowed.' },
        { status: 400 }
      );
    }

    // ── Scrape ──────────────────────────────────────────────────────────

    console.log(`[Scraper API] Starting scrape for: ${url}`);

    const { pages, errors: scrapeErrors } = await scrapeWebsite({
      url,
      maxPages: Math.min(maxPages || 5, 8), // Cap at 8 pages
    });

    if (pages.length === 0) {
      const result: ScrapeResult = {
        status: 'failed',
        pagesScraped: 0,
        durationMs: Date.now() - startTime,
        context: null,
        errors: scrapeErrors.length > 0
          ? scrapeErrors
          : ['Could not extract any content from the website. The site may be JavaScript-rendered or blocking automated access.'],
      };
      return NextResponse.json(result, { status: 422 });
    }

    // ── Extract context ─────────────────────────────────────────────────

    console.log(`[Scraper API] Scraped ${pages.length} pages, extracting context...`);

    const context = await extractBusinessContext(pages);
    const durationMs = Date.now() - startTime;

    const result: ScrapeResult = {
      status: scrapeErrors.length > 0 ? 'partial' : 'success',
      pagesScraped: pages.length,
      durationMs,
      context,
      errors: scrapeErrors.length > 0 ? scrapeErrors : undefined,
      pages: pages.map((p) => ({
        url: p.url,
        title: p.title,
        text: p.text.slice(0, 500) + (p.text.length > 500 ? '...' : ''), // Truncate for response
        type: p.type,
      })),
    };

    console.log(
      `[Scraper API] Done in ${durationMs}ms — ${pages.length} pages, company: "${context.companyName}"`
    );

    return NextResponse.json(result);
  } catch (err) {
    console.error('[Scraper API] Error:', err);
    const message = err instanceof Error ? err.message : 'Failed to scrape website';

    const result: ScrapeResult = {
      status: 'failed',
      pagesScraped: 0,
      durationMs: Date.now() - startTime,
      context: null,
      errors: [message],
    };

    return NextResponse.json(result, { status: 500 });
  }
}
