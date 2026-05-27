-- Optional branding/customization fields on ScreeningLink.
-- All nullable, additive, no defaults, no FK changes, no index changes.
-- Safe to roll forward and back.

ALTER TABLE "ScreeningLink"
  ADD COLUMN "customWelcomeMessage" TEXT,
  ADD COLUMN "customLogoUrl" TEXT,
  ADD COLUMN "ctaUrl" TEXT,
  ADD COLUMN "ctaLabel" TEXT;
