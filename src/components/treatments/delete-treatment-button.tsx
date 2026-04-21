"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeleteTreatmentButton({ id, title }: { id: string; title: string }) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete treatment "${title}"?`)) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/treatments/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      title="Delete treatment"
      className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-[#ccc] hover:text-red-500 p-1"
    >
      {deleting ? (
        <span className="inline-block w-3 h-3 border-2 border-[#999] border-t-transparent rounded-full animate-spin" />
      ) : (
        <Trash2 size={12} />
      )}
    </button>
  );
}
