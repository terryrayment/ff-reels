import { agencyTerritory, companyTerritory } from "./production-companies";

export type SourceTrust = "LOW" | "MEDIUM" | "HIGH";

interface RawCreditShape {
  agency?: string | null;
  directorName?: string | null;
  productionCompany?: string | null;
  sourceName?: string | null;
}

export interface QualifiedIndustryAlert {
  agencyCanonical: string | null;
  agencyTerritory: "EAST" | "MIDWEST" | "WEST" | null;
  alertEligible: boolean;
  alertRejectedReason: string | null;
  confidence: number;
  directorNameCanonical: string | null;
  productionCompanyCanonical: string | null;
  qualifiedAt: Date | null;
  sourceTrust: SourceTrust;
}

const HIGH_TRUST_PATTERNS = [
  /^MANUAL$/i,
  /^SOURCE CREATIVE$/i,
  /^SHOTS$/i,
  /^PROD CO:/i,
  /website$/i,
];

const MEDIUM_TRUST_PATTERNS = [
  /^MUSE BY CLIO$/i,
  /^SHOOT$/i,
];

const AGENCY_PLACEHOLDERS = new Set([
  "",
  "-",
  "—",
  "unknown",
  "client direct",
  "in-house",
  "production company in-house",
]);

const ORGANIZATION_FRAGMENTS = [
  "the partnership",
  "the business",
  "life is famously fast-paced",
  "to outdoor media",
  "c-section recovery",
  "rates may be higher",
  "or in-house team",
  "accelerates its multi-market",
  "model",
  "work",
  "strategy",
  "transformation",
  "innovation",
];

const DIRECTOR_FRAGMENTS = [
  " of ",
  " team ",
  " brand ",
  " office ",
  " agency ",
  " campaign ",
  " strategy ",
  " impact ",
];

function cleanValue(value?: string | null): string | null {
  if (!value) return null;
  const cleaned = value
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || null;
}

function hasLetters(value: string): boolean {
  return /[A-Za-z]/.test(value);
}

function isKnownPlaceholder(value: string, placeholders: Set<string>): boolean {
  return placeholders.has(value.toLowerCase().trim());
}

function looksLikeSentenceFragment(value: string): boolean {
  const lower = value.toLowerCase();
  return (
    ORGANIZATION_FRAGMENTS.some((fragment) => lower.includes(fragment)) ||
    (/^[a-z]/.test(value) && value.split(/\s+/).length >= 3)
  );
}

function normalizeOrganization(value?: string | null): string | null {
  const cleaned = cleanValue(value);
  if (!cleaned) return null;
  if (!hasLetters(cleaned)) return null;
  if (cleaned.length > 80) return null;
  if (cleaned.includes("<") || cleaned.includes("http")) return null;
  if (isKnownPlaceholder(cleaned, AGENCY_PLACEHOLDERS)) return null;
  if (agencyTerritory(cleaned) || companyTerritory(cleaned)) return cleaned;
  if (looksLikeSentenceFragment(cleaned)) return null;
  return cleaned;
}

function normalizeDirector(value?: string | null): string | null {
  const cleaned = cleanValue(value);
  if (!cleaned) return null;
  if (!hasLetters(cleaned)) return null;
  if (cleaned.length < 3 || cleaned.length > 80) return null;
  if (cleaned.includes("<") || cleaned.includes("http")) return null;

  const lower = ` ${cleaned.toLowerCase()} `;
  if (DIRECTOR_FRAGMENTS.some((fragment) => lower.includes(fragment))) return null;

  const tokens = cleaned
    .split(/[,&]/)
    .flatMap((part) => part.trim().split(/\s+/))
    .filter(Boolean);

  if (tokens.length === 0 || tokens.length > 8) return null;
  if (tokens.every((token) => token === token.toLowerCase())) return null;

  return cleaned;
}

export function sourceTrustFor(sourceName?: string | null): SourceTrust {
  const source = cleanValue(sourceName) ?? "";
  if (HIGH_TRUST_PATTERNS.some((pattern) => pattern.test(source))) return "HIGH";
  if (MEDIUM_TRUST_PATTERNS.some((pattern) => pattern.test(source))) return "MEDIUM";
  return "LOW";
}

export function qualifyIndustryAlert(credit: RawCreditShape): QualifiedIndustryAlert {
  const productionCompanyCanonical = normalizeOrganization(credit.productionCompany);
  const directorNameCanonical = normalizeDirector(credit.directorName);
  const agencyCanonical = normalizeOrganization(credit.agency);
  const agencyRegion = agencyCanonical ? agencyTerritory(agencyCanonical) : null;
  const sourceTrust = sourceTrustFor(credit.sourceName);

  // For HIGH trust sources (first-party prodco sites, Source Creative, Shots),
  // we can derive territory from the production company itself. Agency is
  // valuable but shouldn't gate alerts when we have confirmed prodco + director.
  const prodCoRegion = productionCompanyCanonical
    ? companyTerritory(productionCompanyCanonical)
    : null;
  const resolvedTerritory = agencyRegion ?? prodCoRegion;

  const reasons: string[] = [];

  if (sourceTrust === "LOW") reasons.push("low_trust_source");
  if (!productionCompanyCanonical) reasons.push("missing_or_invalid_production_company");
  if (!directorNameCanonical) reasons.push("missing_or_invalid_director");

  // Agency + agency territory are required for LOW/MEDIUM trust sources.
  // HIGH trust sources with a known prodco territory can skip this gate.
  const agencyRequired = sourceTrust !== "HIGH" || !prodCoRegion;
  if (agencyRequired && !agencyCanonical) reasons.push("missing_or_invalid_agency");
  if (agencyRequired && !agencyRegion) reasons.push("missing_agency_territory");
  // Even for HIGH trust, flag if we have no territory at all
  if (!agencyRequired && !resolvedTerritory) reasons.push("missing_territory");

  const trustScore = sourceTrust === "HIGH" ? 0.45 : sourceTrust === "MEDIUM" ? 0.25 : 0.1;
  const confidence = Number(
    Math.min(
      0.98,
      trustScore +
        (productionCompanyCanonical ? 0.18 : 0) +
        (directorNameCanonical ? 0.18 : 0) +
        (agencyCanonical ? 0.11 : 0) +
        (resolvedTerritory ? 0.08 : 0),
    ).toFixed(2),
  );

  const alertEligible = reasons.length === 0;

  return {
    agencyCanonical,
    agencyTerritory: resolvedTerritory,
    alertEligible,
    alertRejectedReason: alertEligible ? null : reasons.join(","),
    confidence,
    directorNameCanonical,
    productionCompanyCanonical,
    qualifiedAt: alertEligible ? new Date() : null,
    sourceTrust,
  };
}
