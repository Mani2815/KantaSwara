// =============================================================================
// Web Scraper — Barrel Export
// =============================================================================

export { scrapeWebsite } from './web-scraper.service';
export { extractBusinessContext } from './context-extractor.service';
export type {
  ScrapeRequest,
  ScrapeResult,
  ScrapedPage,
  ExtractedBusinessContext,
  PageType,
} from './scraper.types';
export { SCRAPER_DEFAULTS } from './scraper.types';
