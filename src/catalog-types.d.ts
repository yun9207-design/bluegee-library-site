export interface Category { id: string; label: string; description: string; }
export interface Series { id: string; label: string; }
export interface Bundle { id: string; title: string; status: 'planned' | 'published'; productIds: string[]; }
export interface Chapter { id: string; title: string; }
export interface KeywordSource { keywords: string[]; chapterId: string; heading: string; }
export interface Product {
  id: string;
  number: string;
  slug: string;
  title: string;
  brand: string | null;
  series: string | null;
  category: string;
  subcategory: string | null;
  equipmentType: string | null;
  description: string | null;
  keywords: string[];
  htmlPath: string | null;
  pdfPath: string | null;
  coverImage: string | null;
  status: 'published' | 'draft' | 'unknown';
  featured: boolean;
  relatedIds: string[];
  bundleIds: string[];
  createdAt: string | null;
  updatedAt: string | null;
  keywordSources: KeywordSource[];
  highlights?: string[];
  whyItMatters?: string | null;
  access?: 'public' | 'entitlement';
  chapters?: Chapter[];
}
export interface RuntimeProduct extends Product { chapters: Chapter[]; chapterCount: number; }
export interface CatalogSource { schemaVersion: 1; categories: Category[]; series: Series[]; bundles: Bundle[]; products: Product[]; }
export interface RuntimeCatalog extends Omit<CatalogSource, 'products'> { products: RuntimeProduct[]; }
export interface Filters { query?: string; category?: string; brand?: string; equipmentType?: string; }
export interface LegacyGuide {
  id: string; title: string; category: string; kind: string | null; description: string | null;
  filename: string; chapters: Chapter[]; url: string;
}
export interface ProductDetail {
  product: RuntimeProduct;
  category: Category | null;
  series: Series | null;
  relatedProducts: RuntimeProduct[];
  sameBrandProducts: RuntimeProduct[];
  bundles: Bundle[];
  highlights: string[];
  whyItMatters: string;
  previousProduct: RuntimeProduct | null;
  nextProduct: RuntimeProduct | null;
}
