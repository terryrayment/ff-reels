"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink, RefreshCw } from "lucide-react";

type ProjectField = {
  id: string;
  name: string;
  type: "TEXT" | "SINGLE_SELECT";
  options?: Array<{ id: string; name: string }>;
};

type ProjectRow = {
  id: string;
  title: string;
  values: Record<string, string | number | null>;
};

type ProjectResponse = {
  project: {
    id: string;
    title: string;
    url: string;
    fields: ProjectField[];
    rows: ProjectRow[];
  };
};

type ErrorResponse = {
  error: string;
  projectUrl?: string;
};

const endpoint = "/api/leads/west-coast-brand";

function getDisplayValue(field: ProjectField, value: string | number | null) {
  if (field.type === "SINGLE_SELECT") {
    return field.options?.find((option) => option.id === value)?.name || "";
  }
  return value == null ? "" : String(value);
}

function EditableCell({
  field,
  value,
  disabled,
  onSave,
}: {
  field: ProjectField;
  value: string | number | null;
  disabled: boolean;
  onSave: (value: string | number | null) => void;
}) {
  if (field.type === "SINGLE_SELECT") {
    return (
      <select
        value={typeof value === "string" ? value : ""}
        disabled={disabled}
        onChange={(event) => onSave(event.target.value)}
        className="h-8 min-w-[150px] rounded-md border border-transparent bg-transparent px-2 text-[13px] text-[#222] outline-none transition-colors hover:border-[#D8D6D0] focus:border-[#111] disabled:opacity-50"
      >
        <option value="">-</option>
        {(field.options || []).map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      type="text"
      defaultValue={getDisplayValue(field, value)}
      disabled={disabled}
      onBlur={(event) => {
        const nextValue = event.target.value;
        if (String(nextValue ?? "") !== String(value ?? "")) {
          onSave(nextValue);
        }
      }}
      className="h-8 min-w-[150px] rounded-md border border-transparent bg-transparent px-2 text-[13px] text-[#222] outline-none transition-colors hover:border-[#D8D6D0] focus:border-[#111] disabled:opacity-50"
    />
  );
}

export function WestCoastBrandTable() {
  const [data, setData] = useState<ProjectResponse | null>(null);
  const [error, setError] = useState<ErrorResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingCell, setSavingCell] = useState<string | null>(null);

  const visibleFields = useMemo(() => {
    return (data?.project.fields || []).filter((field) => field.name !== "Title");
  }, [data]);

  const loadProject = useCallback(async () => {
    setLoading(true);
    setError(null);

    const response = await fetch(endpoint, { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) {
      setData(null);
      setError(payload);
    } else {
      setData(payload);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadProject();
  }, [loadProject]);

  const saveCell = async (
    row: ProjectRow,
    field: ProjectField,
    value: string | number | null,
  ) => {
    const cellKey = `${row.id}:${field.id}`;
    setSavingCell(cellKey);
    setError(null);

    const response = await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: data?.project.id,
        itemId: row.id,
        fieldId: field.id,
        type: field.type,
        value,
      }),
    });

    const payload = await response.json();
    if (!response.ok) {
      setError(payload);
    } else {
      setData((current) => {
        if (!current) return current;
        return {
          project: {
            ...current.project,
            rows: current.project.rows.map((candidate) =>
              candidate.id === row.id
                ? {
                    ...candidate,
                    values: {
                      ...candidate.values,
                      [field.id]: value,
                    },
                  }
                : candidate,
            ),
          },
        };
      });
    }

    setSavingCell(null);
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-230px)] min-h-[620px] items-center justify-center text-[12px] uppercase tracking-[0.14em] text-[#999]">
        Loading WEST COAST - BRAND
      </div>
    );
  }

  if (error || !data) {
    const projectUrl = error?.projectUrl || "https://github.com/users/terryrayment/projects/3";

    return (
      <div className="flex h-[calc(100vh-230px)] min-h-[620px] flex-col items-center justify-center px-8 text-center">
        <p className="max-w-md text-[18px] font-semibold text-[#111]">
          WEST COAST - BRAND could not load.
        </p>
        <p className="mt-3 max-w-md text-[13px] leading-6 text-[#666]">
          {error?.error || "The lead table could not be loaded."}
        </p>
        <div className="mt-6 flex items-center gap-2">
          <button
            type="button"
            onClick={() => void loadProject()}
            className="inline-flex items-center gap-2 rounded-full border border-[#D8D6D0] bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#333] transition-colors hover:border-[#111]"
          >
            <RefreshCw size={13} />
            Retry
          </button>
          <a
            href={projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#111] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#333]"
          >
            <ExternalLink size={13} />
            Open GitHub
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-230px)] min-h-[620px] overflow-auto">
      <table className="min-w-full border-collapse text-left">
        <thead className="sticky top-0 z-10 bg-[#F3F3F1]">
          <tr>
            <th className="w-[320px] border-b border-[#E8E6E1] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#777]">
              Lead
            </th>
            {visibleFields.map((field) => (
              <th
                key={field.id}
                className="border-b border-[#E8E6E1] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#777]"
              >
                {field.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.project.rows.map((row) => (
            <tr key={row.id} className="border-b border-[#EFEDE8]">
              <td className="max-w-[360px] px-4 py-3 text-[13px] font-medium text-[#222]">
                {row.title}
              </td>
              {visibleFields.map((field) => {
                const cellKey = `${row.id}:${field.id}`;
                return (
                  <td key={field.id} className="px-2 py-2 align-middle">
                    <EditableCell
                      field={field}
                      value={row.values[field.id] ?? ""}
                      disabled={savingCell === cellKey}
                      onSave={(value) => void saveCell(row, field, value)}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {data.project.rows.length === 0 && (
        <div className="flex h-64 items-center justify-center text-[13px] text-[#777]">
          No rows found in this lead table.
        </div>
      )}

      {savingCell && (
        <div className="fixed bottom-5 right-5 rounded-full border border-[#DDDAD3] bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#555] shadow-lg">
          Saving
        </div>
      )}
    </div>
  );
}
