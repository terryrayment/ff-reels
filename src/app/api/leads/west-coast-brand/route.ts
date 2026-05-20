import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { canAccessLeads } from "@/lib/leads-access";
import { WEST_COAST_BRAND_PROJECT } from "@/lib/github-projects";
import { westCoastBrandLeadSeed } from "@/lib/west-coast-brand-leads";

export const dynamic = "force-dynamic";

type LeadField = {
  id: string;
  name: string;
  type: "TEXT" | "SINGLE_SELECT";
  options?: Array<{ id: string; name: string }>;
};

type LeadRow = {
  id: string;
  title: string;
  values: Record<string, string | number | null>;
};

type ContactWithCompany = {
  id: string;
  name: string;
  email: string;
  notes: string | null;
  tags: string[];
  company: { name: string } | null;
};

const SOURCE = "west-coast-brand";
const SOURCE_TAG = `lead-source:${SOURCE}`;
const SYNTHETIC_EMAIL_DOMAIN = "ff.local";

const TAG_PREFIX = {
  status: "lead-status:",
  verified: "lead-verified:",
  city: "lead-city:",
  sector: "lead-sector:",
  position: "lead-position:",
  displayEmail: "lead-display-email:",
} as const;
const LEAD_TAG_PREFIXES = Object.values(TAG_PREFIX);

const statusOptions = [
  "Not Sent",
  "Sent",
  "Follow-up Sent",
  "Replied",
  "Call Booked",
  "In Bid",
  "Won",
  "Cold",
  "Pass",
];

const fields: LeadField[] = [
  {
    id: "status",
    name: "Status",
    type: "SINGLE_SELECT",
    options: statusOptions.map((name) => ({ id: name, name })),
  },
  { id: "person", name: "Person", type: "TEXT" },
  { id: "company", name: "Company", type: "TEXT" },
  { id: "email", name: "Email", type: "TEXT" },
  {
    id: "emailVerified",
    name: "Email Verified",
    type: "SINGLE_SELECT",
    options: [
      { id: "verified", name: "Verified" },
      { id: "verify", name: "Verify" },
    ],
  },
  { id: "city", name: "City", type: "TEXT" },
  { id: "sector", name: "Sector", type: "TEXT" },
  { id: "note", name: "Note", type: "TEXT" },
];

async function requireLeadsAccess() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!canAccessLeads(session.user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

function tagValue(tags: string[], prefix: string, fallback = "") {
  return tags.find((tag) => tag.startsWith(prefix))?.slice(prefix.length) || fallback;
}

function setTag(tags: string[], prefix: string, value: string) {
  const filtered = tags.filter((tag) => !tag.startsWith(prefix));
  if (!value) return filtered;
  return [...filtered, `${prefix}${value}`];
}

function mergeLeadTags(existingTags: string[], leadTags: string[]) {
  const nonLeadTags = existingTags.filter((tag) => {
    return tag !== SOURCE_TAG && !LEAD_TAG_PREFIXES.some((prefix) => tag.startsWith(prefix));
  });
  return [...nonLeadTags, ...leadTags];
}

function syntheticEmail(position: number) {
  return `${SOURCE}-${position}@${SYNTHETIC_EMAIL_DOMAIN}`;
}

function normalizeEmail(email: string, position: number) {
  const trimmed = email.trim();
  return trimmed.includes("@") ? trimmed.toLowerCase() : syntheticEmail(position);
}

function rowFromContact(contact: ContactWithCompany): LeadRow {
  const tags = contact.tags || [];
  const position = Number(tagValue(tags, TAG_PREFIX.position, "0")) || 0;
  const email = tagValue(tags, TAG_PREFIX.displayEmail, contact.email);
  const isSynthetic = contact.email.endsWith(`@${SYNTHETIC_EMAIL_DOMAIN}`);
  const displayEmail = isSynthetic ? email : contact.email;
  const company = contact.company?.name || "";

  return {
    id: contact.id,
    title: position > 0 ? `#${position} - ${contact.name} - ${company}` : contact.name,
    values: {
      status: tagValue(tags, TAG_PREFIX.status, "Not Sent"),
      person: contact.name,
      company,
      email: displayEmail,
      emailVerified:
        tagValue(tags, TAG_PREFIX.verified, "false") === "true" ? "verified" : "verify",
      city: tagValue(tags, TAG_PREFIX.city),
      sector: tagValue(tags, TAG_PREFIX.sector),
      note: contact.notes || "",
    },
  };
}

async function seedIfNeeded() {
  const existing = await prisma.contact.count({
    where: { tags: { has: SOURCE_TAG } },
  });
  if (existing > 0) return;

  for (const lead of westCoastBrandLeadSeed) {
    const company = await prisma.company.upsert({
      where: { name: lead.company },
      create: { name: lead.company, type: "Brand" },
      update: {},
    });

    const baseTags = [
      SOURCE_TAG,
      `${TAG_PREFIX.position}${lead.position}`,
      `${TAG_PREFIX.status}Not Sent`,
      `${TAG_PREFIX.verified}${lead.emailVerified ? "true" : "false"}`,
      `${TAG_PREFIX.city}${lead.city}`,
      `${TAG_PREFIX.sector}${lead.sector}`,
      `${TAG_PREFIX.displayEmail}${lead.email}`,
    ];

    const email = normalizeEmail(lead.email, lead.position);
    const existingContact = await prisma.contact.findUnique({
      where: { email },
      select: { tags: true },
    });
    const tags = mergeLeadTags(existingContact?.tags || [], baseTags);

    if (existingContact) {
      await prisma.contact.update({
        where: { email },
        data: {
          companyId: company.id,
          tags,
        },
      });
    } else {
      await prisma.contact.create({
        data: {
          name: lead.person,
          email,
          companyId: company.id,
          role: "Brand lead",
          notes: lead.note,
          tags,
        },
      });
    }
  }
}

async function getRows() {
  await seedIfNeeded();

  const contacts = await prisma.contact.findMany({
    where: { tags: { has: SOURCE_TAG } },
    include: { company: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  return contacts
    .map(rowFromContact)
    .sort((a, b) => {
      return (
        Number(a.title.match(/^#(\d+)/)?.[1] || 0) -
        Number(b.title.match(/^#(\d+)/)?.[1] || 0)
      );
    });
}

export async function GET() {
  const denied = await requireLeadsAccess();
  if (denied) return denied;

  const rows = await getRows();
  return NextResponse.json({
    project: {
      id: SOURCE,
      title: WEST_COAST_BRAND_PROJECT.title,
      url: WEST_COAST_BRAND_PROJECT.url,
      fields,
      rows,
    },
  });
}

export async function PATCH(request: Request) {
  const denied = await requireLeadsAccess();
  if (denied) return denied;

  const body = await request.json();
  const { itemId, fieldId, value } = body || {};
  if (!itemId || !fieldId) {
    return NextResponse.json({ error: "Missing field update data." }, { status: 400 });
  }

  const contact = await prisma.contact.findUnique({
    where: { id: itemId },
    include: { company: { select: { id: true, name: true } } },
  });
  if (!contact || !contact.tags.includes(SOURCE_TAG)) {
    return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  }

  const nextValue = String(value ?? "").trim();
  let nextTags = contact.tags;
  const data: {
    name?: string;
    email?: string;
    companyId?: string | null;
    notes?: string | null;
    tags?: string[];
  } = {};

  if (fieldId === "status") {
    nextTags = setTag(nextTags, TAG_PREFIX.status, nextValue || "Not Sent");
    data.tags = nextTags;
  } else if (fieldId === "person") {
    data.name = nextValue || contact.name;
  } else if (fieldId === "company") {
    if (nextValue) {
      const company = await prisma.company.upsert({
        where: { name: nextValue },
        create: { name: nextValue, type: "Brand" },
        update: {},
      });
      data.companyId = company.id;
    }
  } else if (fieldId === "email") {
    nextTags = setTag(nextTags, TAG_PREFIX.displayEmail, nextValue);
    data.tags = nextTags;
    if (nextValue.includes("@")) {
      data.email = nextValue.toLowerCase();
    }
  } else if (fieldId === "emailVerified") {
    nextTags = setTag(nextTags, TAG_PREFIX.verified, nextValue === "verified" ? "true" : "false");
    data.tags = nextTags;
  } else if (fieldId === "city") {
    nextTags = setTag(nextTags, TAG_PREFIX.city, nextValue);
    data.tags = nextTags;
  } else if (fieldId === "sector") {
    nextTags = setTag(nextTags, TAG_PREFIX.sector, nextValue);
    data.tags = nextTags;
  } else if (fieldId === "note") {
    data.notes = nextValue;
  } else {
    return NextResponse.json({ error: "Unsupported field." }, { status: 400 });
  }

  try {
    await prisma.contact.update({
      where: { id: itemId },
      data,
    });
  } catch {
    return NextResponse.json(
      { error: "Could not save this cell. The email may already exist." },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true });
}
