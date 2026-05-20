import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { canAccessLeads } from "@/lib/leads-access";
import {
  getGitHubProjectToken,
  WEST_COAST_BRAND_PROJECT,
} from "@/lib/github-projects";

export const dynamic = "force-dynamic";

type GitHubField = {
  id: string;
  name: string;
  type: "TEXT" | "SINGLE_SELECT" | "DATE" | "NUMBER" | "UNKNOWN";
  options?: Array<{ id: string; name: string; color?: string }>;
};

type GitHubRow = {
  id: string;
  title: string;
  body?: string | null;
  url?: string | null;
  values: Record<string, string | number | null>;
};

type RawProjectField = {
  id?: string;
  name?: string;
  dataType?: string;
  options?: Array<{ id: string; name: string; color?: string }>;
} | null | undefined;

type RawProjectFieldValue = {
  __typename?: string;
  text?: string | null;
  optionId?: string | null;
  date?: string | null;
  number?: number | null;
  field?: RawProjectField;
};

type RawProjectItem = {
  id: string;
  content?: {
    title?: string | null;
    body?: string | null;
    url?: string | null;
  } | null;
  fieldValues?: {
    nodes?: RawProjectFieldValue[];
  } | null;
};

type RawProjectData = {
  user?: {
    projectV2?: {
      id: string;
      title?: string | null;
      url?: string | null;
      fields?: {
        nodes?: RawProjectField[];
      } | null;
      items?: {
        nodes?: RawProjectItem[];
      } | null;
    } | null;
  } | null;
};

type ProjectPayload = {
  project: {
    id: string;
    title: string;
    url: string;
    fields: GitHubField[];
    rows: GitHubRow[];
  };
};

const fieldFragment = `
  __typename
  ... on ProjectV2Field {
    id
    name
    dataType
  }
  ... on ProjectV2SingleSelectField {
    id
    name
    dataType
    options {
      id
      name
      color
    }
  }
  ... on ProjectV2IterationField {
    id
    name
    dataType
  }
`;

const projectQuery = `
  query WestCoastBrandProject($owner: String!, $number: Int!) {
    user(login: $owner) {
      projectV2(number: $number) {
        id
        title
        url
        fields(first: 50) {
          nodes {
            ${fieldFragment}
          }
        }
        items(first: 100) {
          nodes {
            id
            content {
              __typename
              ... on DraftIssue {
                title
                body
              }
              ... on Issue {
                title
                url
              }
              ... on PullRequest {
                title
                url
              }
            }
            fieldValues(first: 50) {
              nodes {
                __typename
                ... on ProjectV2ItemFieldTextValue {
                  text
                  field {
                    ${fieldFragment}
                  }
                }
                ... on ProjectV2ItemFieldSingleSelectValue {
                  name
                  optionId
                  field {
                    ${fieldFragment}
                  }
                }
                ... on ProjectV2ItemFieldDateValue {
                  date
                  field {
                    ${fieldFragment}
                  }
                }
                ... on ProjectV2ItemFieldNumberValue {
                  number
                  field {
                    ${fieldFragment}
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const updateMutation = `
  mutation UpdateWestCoastBrandCell(
    $projectId: ID!
    $itemId: ID!
    $fieldId: ID!
    $value: ProjectV2FieldValue!
  ) {
    updateProjectV2ItemFieldValue(
      input: {
        projectId: $projectId
        itemId: $itemId
        fieldId: $fieldId
        value: $value
      }
    ) {
      projectV2Item {
        id
      }
    }
  }
`;

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

async function githubGraphql<T>(
  query: string,
  variables: Record<string, unknown>,
) {
  const token = getGitHubProjectToken();
  if (!token) {
    return {
      error: NextResponse.json(
        {
          error:
            "GitHub project token is not configured. Set GITHUB_PROJECT_TOKEN with project read/write scope.",
          projectUrl: WEST_COAST_BRAND_PROJECT.url,
        },
        { status: 503 },
      ),
    };
  }

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "ff-reels",
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  const payload = await response.json();
  if (!response.ok || payload.errors?.length) {
    return {
      error: NextResponse.json(
        {
          error:
            payload.errors?.map((item: { message: string }) => item.message).join(", ") ||
            "GitHub Projects request failed.",
          projectUrl: WEST_COAST_BRAND_PROJECT.url,
        },
        { status: response.ok ? 502 : response.status },
      ),
    };
  }

  return { data: payload.data as T };
}

function normalizeField(field: RawProjectField): GitHubField | null {
  if (!field?.id || !field?.name) return null;
  if (field.dataType === "TEXT") {
    return { id: field.id, name: field.name, type: "TEXT" };
  }
  if (field.dataType === "SINGLE_SELECT") {
    return {
      id: field.id,
      name: field.name,
      type: "SINGLE_SELECT",
      options: field.options || [],
    };
  }
  if (field.dataType === "DATE") {
    return { id: field.id, name: field.name, type: "DATE" };
  }
  if (field.dataType === "NUMBER") {
    return { id: field.id, name: field.name, type: "NUMBER" };
  }
  return { id: field.id, name: field.name, type: "UNKNOWN" };
}

function normalizeProject(data: RawProjectData): ProjectPayload {
  const project = data.user?.projectV2;
  if (!project) {
    throw new Error("GitHub project not found.");
  }

  const fields = (project?.fields?.nodes || [])
    .map(normalizeField)
    .filter((field: GitHubField | null): field is GitHubField => {
      return !!field && field.type !== "UNKNOWN";
    });

  const rows = (project?.items?.nodes || []).map((item) => {
    const values: GitHubRow["values"] = {};
    for (const value of item.fieldValues?.nodes || []) {
      const field = normalizeField(value.field);
      if (!field || field.type === "UNKNOWN") continue;

      if (value.__typename === "ProjectV2ItemFieldTextValue") {
        values[field.id] = value.text || "";
      } else if (value.__typename === "ProjectV2ItemFieldSingleSelectValue") {
        values[field.id] = value.optionId || "";
      } else if (value.__typename === "ProjectV2ItemFieldDateValue") {
        values[field.id] = value.date || "";
      } else if (value.__typename === "ProjectV2ItemFieldNumberValue") {
        values[field.id] = value.number ?? null;
      }
    }

    return {
      id: item.id,
      title: item.content?.title || "Untitled",
      body: item.content?.body || null,
      url: item.content?.url || null,
      values,
    };
  });

  return {
    project: {
      id: project.id,
      title: project.title || WEST_COAST_BRAND_PROJECT.title,
      url: project.url || WEST_COAST_BRAND_PROJECT.url,
      fields,
      rows,
    },
  };
}

export async function GET() {
  const denied = await requireLeadsAccess();
  if (denied) return denied;

  const result = await githubGraphql<RawProjectData>(projectQuery, {
    owner: WEST_COAST_BRAND_PROJECT.owner,
    number: WEST_COAST_BRAND_PROJECT.number,
  });
  if (result.error) return result.error;
  if (!result.data.user?.projectV2?.id) {
    return NextResponse.json(
      {
        error: "GitHub Project was not found or is not visible to this token.",
        projectUrl: WEST_COAST_BRAND_PROJECT.url,
      },
      { status: 404 },
    );
  }

  return NextResponse.json(normalizeProject(result.data));
}

export async function PATCH(request: Request) {
  const denied = await requireLeadsAccess();
  if (denied) return denied;

  const body = await request.json();
  const { projectId, itemId, fieldId, type, value } = body || {};
  if (!projectId || !itemId || !fieldId || !type) {
    return NextResponse.json({ error: "Missing field update data." }, { status: 400 });
  }

  const fieldValue =
    type === "SINGLE_SELECT"
      ? { singleSelectOptionId: value || null }
      : type === "DATE"
        ? { date: value || null }
        : type === "NUMBER"
          ? { number: value === "" || value == null ? null : Number(value) }
          : { text: value ?? "" };

  const result = await githubGraphql(updateMutation, {
    projectId,
    itemId,
    fieldId,
    value: fieldValue,
  });
  if (result.error) return result.error;

  return NextResponse.json({ ok: true });
}
