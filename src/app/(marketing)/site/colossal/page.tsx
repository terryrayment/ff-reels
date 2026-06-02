import type { Metadata } from "next";
import { PartnerPage } from "@/components/marketing/partner-portal";

export const metadata: Metadata = {
  title: "COLOSSAL",
  description:
    "COLOSSAL extends Friends & Family into post, animation, VFX, compositing, motion design, and finishing from Curitiba.",
};

export default function ColossalPage() {
  return <PartnerPage partnerId="colossal" />;
}
