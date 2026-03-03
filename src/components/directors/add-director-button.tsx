"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Textarea } from "@/components/ui/input";

export function AddDirectorButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [categories, setCategories] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/directors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          bio: bio || undefined,
          categories: categories
            ? categories.split(",").map((c) => c.trim().toLowerCase())
            : [],
        }),
      });

      if (res.ok) {
        const director = await res.json();
        setOpen(false);
        setName("");
        setBio("");
        setCategories("");
        router.push(`/directors/${director.id}`);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        <Plus size={14} />
        Add Director
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add Director"
        description="Add a new director to the roster."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="name"
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. James Frost"
            required
            autoFocus
          />
          <Textarea
            id="bio"
            label="Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Short bio (optional)"
            rows={3}
          />
          <Input
            id="categories"
            label="Categories"
            value={categories}
            onChange={(e) => setCategories(e.target.value)}
            placeholder="comedy, automotive, food (comma-separated)"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Add Director
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
