export function isPrismaSchemaDriftError(error: unknown) {
  if (!error || typeof error !== "object") return false;

  const code = "code" in error ? (error as { code?: unknown }).code : null;
  return code === "P2021" || code === "P2022";
}

export function shouldUseMarketingProductionFallback(error: unknown) {
  return (
    isPrismaSchemaDriftError(error) &&
    process.env.VERCEL_ENV !== "production"
  );
}
