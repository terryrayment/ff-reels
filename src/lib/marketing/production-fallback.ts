const FF_PRODUCTION_ORIGIN = "https://reels.friendsandfamily.tv";
const FALLBACK_FETCH_TIMEOUT_MS = 4500;

const DISCIPLINE_PATHS: Record<string, string> = {
  SPOT: "/site/work?type=commercials",
  CASE_STUDY: "/site/work?type=case-studies",
  SHORT_FILM: "/site/work?type=films",
};

export type ProductionWorkItem = {
  id: string;
  title: string;
  brand: string | null;
  agency?: string | null;
  year: number | null;
  category?: string | null;
  contentType: string | null;
  thumbnailUrl: string | null;
  muxPlaybackId: string | null;
  director: { slug: string; name: string };
};

export type ProductionDirectorItem = {
  id: string;
  slug: string;
  name: string;
  positioning: string | null;
  stillUrl: string | null;
  cardPlaybackId: string | null;
  playProjectId: string | null;
};

function productionWorkPath(contentType: string | null) {
  return contentType ? DISCIPLINE_PATHS[contentType] ?? "/site/work" : "/site/work";
}

async function fetchProductionPath(path: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FALLBACK_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(`${FF_PRODUCTION_ORIGIN}${path}`, {
      next: { revalidate: 300 },
      signal: controller.signal,
    });

    return response.ok ? response.text() : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function extractFlightText(html: string) {
  const chunks: string[] = [];
  const chunkPattern =
    /self\.__next_f\.push\(\[1,"((?:\\.|[^"\\])*)"\]\)<\/script>/g;
  let match: RegExpExecArray | null;

  while ((match = chunkPattern.exec(html))) {
    chunks.push(JSON.parse(`"${match[1]}"`) as string);
  }

  return chunks.join("");
}

function readJsonObjectAt(text: string, start: number) {
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i += 1) {
    const char = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
    } else if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }

  return null;
}

function absolutizeProductionUrl(url: string | null) {
  if (url?.startsWith("/api/projects/")) return null;
  if (!url?.startsWith("/")) return url;
  return `${FF_PRODUCTION_ORIGIN}${url}`;
}

function scanJsonObjects<T>(
  flightText: string,
  marker: string,
  parse: (json: string) => T | null,
) {
  const items: T[] = [];
  let index = 0;

  while (index < flightText.length) {
    const markerIndex = flightText.indexOf(marker, index);
    if (markerIndex === -1) break;

    const start = flightText.indexOf("{", markerIndex);
    const json = start === -1 ? null : readJsonObjectAt(flightText, start);
    if (!json) break;

    const item = parse(json);
    if (item) items.push(item);
    index = start + json.length;
  }

  return items;
}

function parseProductionWork(html: string, contentType: string | null) {
  const flightText = extractFlightText(html);
  const items = scanJsonObjects<ProductionWorkItem>(
    flightText,
    '"project":',
    (json) => {
      const project = JSON.parse(json) as ProductionWorkItem;
      if (contentType && project.contentType !== contentType) return null;

      return {
        ...project,
        thumbnailUrl: absolutizeProductionUrl(project.thumbnailUrl),
      };
    },
  );

  const countMatch = flightText.match(
    /"className":"ff-kicker","children":\[(\d+)," ",/,
  );
  const totalCount = countMatch ? Number(countMatch[1]) : items.length;

  return { items, totalCount };
}

function parseProductionDirectors(html: string) {
  const flightText = extractFlightText(html);

  return scanJsonObjects<ProductionDirectorItem>(
    flightText,
    '{"slug":"',
    (json) => {
      const director = JSON.parse(json) as {
        slug?: string;
        name?: string;
        positioning?: string | null;
        stillUrl?: string | null;
        muxPlaybackId?: string | null;
        playProjectId?: string | null;
        indexMeta?: string | null;
      };

      if (!director.slug || !director.name || director.indexMeta !== "Director") {
        return null;
      }

      return {
        id: director.slug,
        slug: director.slug,
        name: director.name,
        positioning: director.positioning ?? null,
        stillUrl: absolutizeProductionUrl(director.stillUrl ?? null),
        cardPlaybackId: director.muxPlaybackId ?? null,
        playProjectId: director.playProjectId ?? null,
      };
    },
  );
}

export async function getFriendsAndFamilyProductionWork(
  contentType: string | null,
) {
  const html = await fetchProductionPath(productionWorkPath(contentType));
  if (!html) return { items: [] as ProductionWorkItem[], totalCount: 0 };
  return parseProductionWork(html, contentType);
}

export async function getFriendsAndFamilyProductionDirectors() {
  const html = await fetchProductionPath("/site");
  return html ? parseProductionDirectors(html) : [];
}

export async function getFriendsAndFamilyProductionHomepage() {
  const [featuredDirectors, work] = await Promise.all([
    getFriendsAndFamilyProductionDirectors(),
    getFriendsAndFamilyProductionWork(null),
  ]);

  return {
    featuredDirectors,
    recentProjects: work.items.slice(0, 8),
  };
}

function nameFromSlug(slug: string) {
  if (slug === "youth") return "YOUTH";
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function getFriendsAndFamilyProductionDirector(slug: string) {
  const [directors, work] = await Promise.all([
    getFriendsAndFamilyProductionDirectors(),
    getFriendsAndFamilyProductionWork(null),
  ]);
  const director = directors.find((item) => item.slug === slug);
  const name = director?.name ?? nameFromSlug(slug);
  const projects = work.items
    .filter((project) => project.director.slug === slug)
    .map((project) => ({
      id: project.id,
      title: project.title,
      brand: project.brand,
      agency: project.agency ?? null,
      year: project.year,
      thumbnailUrl: project.thumbnailUrl,
      muxPlaybackId: project.muxPlaybackId,
      category: project.category ?? null,
      contentType: project.contentType,
    }));

  return {
    id: director?.id ?? slug,
    name,
    slug,
    bio: null,
    statement: null,
    videoIntroUrl: director?.cardPlaybackId ?? null,
    awards: [],
    pressLinks: [],
    clientLogos: [],
    isActive: true,
    rosterStatus: "ROSTER",
    projects,
  };
}
