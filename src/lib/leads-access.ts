const DEFAULT_LEADS_URL =
  "https://airtable.com/appfCBl4ZKJqaToNM/shrt6NYAnQ6fd4xg0";
const DEFAULT_LEADS_PASSWORD = "ccco26";

const BLOCKED_LEADS_EMAILS = [
  "katie.northy@talk-shop.tv",
  "kenard.jackson@talk-shop.tv",
  "calebslain@gmail.com",
  "james@unclelefty.com",
  "laurel-ann@unclelefty.com",
];

function parseCsv(value?: string | null) {
  return (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getLeadsAirtableUrl() {
  return process.env.LEADS_AIRTABLE_URL || DEFAULT_LEADS_URL;
}

export function getLeadsEmbedUrl() {
  const configured = process.env.LEADS_AIRTABLE_EMBED_URL;
  if (configured) return configured;

  const sourceUrl = getLeadsAirtableUrl();
  try {
    const url = new URL(sourceUrl);
    if (!url.pathname.startsWith("/embed/")) {
      url.pathname = `/embed${url.pathname}`;
    }
    url.searchParams.set("backgroundColor", "grayLight");
    url.searchParams.set("viewControls", "on");
    return url.toString();
  } catch {
    return sourceUrl;
  }
}

export function getLeadsPasswordHint() {
  return process.env.LEADS_AIRTABLE_PASSWORD || DEFAULT_LEADS_PASSWORD;
}

export function canAccessLeads(user?: {
  email?: string | null;
  role?: string | null;
}) {
  if (!user) return false;
  const userEmail = user.email?.toLowerCase();

  const blockedEmails = new Set(
    [
      ...BLOCKED_LEADS_EMAILS,
      ...parseCsv(process.env.LEADS_BLOCKED_EMAILS),
    ].map((email) => email.toLowerCase()),
  );
  if (userEmail && blockedEmails.has(userEmail)) return false;

  const allowedRoles = new Set(
    ["ADMIN", "PRODUCER", "REP", ...parseCsv(process.env.LEADS_ALLOWED_ROLES)].map((role) =>
      role.toUpperCase(),
    ),
  );
  if (user.role && allowedRoles.has(user.role.toUpperCase())) return true;

  const allowedEmails = new Set(
    parseCsv(process.env.LEADS_ALLOWED_EMAILS).map((email) =>
      email.toLowerCase(),
    ),
  );
  return !!userEmail && allowedEmails.has(userEmail);
}
