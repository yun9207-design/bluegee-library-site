import type { LegacyGuide, RuntimeCatalog } from './catalog-types';
import type { createCatalog, normalizeSearch, libraryUrl, productUrl } from './catalog-core';
declare global {
  interface Window {
    AudioGuide?: { selectChapter: (index: number, anchor?: string, update?: boolean) => void; chapterCount: number };
    BLUEGEE_AUTH_CONFIG?: { configured: boolean; url: string|null; publishableKey: string|null };
    BLUEGEE_LIBRARY: RuntimeCatalog;
    BLUEGEE_PRODUCTS: RuntimeCatalog['products'];
    BLUEGEE_CATALOG: LegacyGuide[];
    BluegeeCatalog: { createCatalog: typeof createCatalog; normalizeSearch: typeof normalizeSearch; libraryUrl: typeof libraryUrl; productUrl: typeof productUrl };
    BluegeeLibrary: ReturnType<typeof createCatalog>;
  }
}
export {};
