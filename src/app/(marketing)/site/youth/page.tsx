import type { Metadata } from "next";
import { PartnerPage } from "@/components/marketing/partner-portal";

export const metadata: Metadata = {
  title: "THE YOUTH COMPANY",
  description:
    "THE YOUTH COMPANY extends Friends & Family through São Paulo directors, casting, production, and culture work across the Americas.",
};

export default function YouthPage() {
  return <PartnerPage partnerId="youth" />;
}
