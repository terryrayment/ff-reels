export interface ScrapedCredit {
  brand: string;
  campaignName?: string;
  agency?: string;
  productionCompany?: string;
  directorName?: string;
  category?: string;
  territory?: "EAST" | "MIDWEST" | "WEST";
  sourceUrl?: string;
  sourceName: string;
  thumbnailUrl?: string;
  publishedAt?: Date;
}

export interface SourceAdapter {
  name: string;
  scrape(): Promise<ScrapedCredit[]>;
}
