"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { ContactAutocomplete } from "@/components/contacts/contact-autocomplete";

interface SelectedContact {
  id: string;
  name: string;
  email: string;
  role: string | null;
  company: { id: string; name: string } | null;
}

interface CreateScreeningLinkProps {
  reelId: string;
}

export function CreateScreeningLink({ reelId }: CreateScreeningLinkProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createdUrl, setCreatedUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientCompany, setRecipientCompany] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("30");
  const [selectedContact, setSelectedContact] = useState<SelectedContact | null>(null);
  const router = useRouter();

  const handleContactSelect = (contact: SelectedContact) => {
    setSelectedContact(contact);
    setRecipientName(contact.name);
    setRecipientEmail(contact.email);
    setRecipientCompany(contact.company?.name || "");
  };

  const handleContactClear = () => {
    setSelectedContact(null);
    setRecipientName("");
    setRecipientEmail("");
    setRecipientCompany("");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/reels/${reelId}/screening-links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: recipientName || undefined,
          recipientEmail: recipientEmail || undefined,
          recipientCompany: recipientCompany || undefined,
          expiresInDays: expiresInDays ? parseInt(expiresInDays) : undefined,
          contactId: selectedContact?.id || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCreatedUrl(data.url);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(createdUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setOpen(false);
    setCreatedUrl("");
    setRecipientName("");
    setRecipientEmail("");
    setRecipientCompany("");
    setExpiresInDays("30");
    setSelectedContact(null);
    setCopied(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm" variant="secondary">
        <Link2 size={14} />
        Create Link
      </Button>

      <Modal
        open={open}
        onClose={handleClose}
        title={createdUrl ? "Link Created" : "Create Screening Link"}
        description={createdUrl ? "Share this link with the recipient." : "Generate a trackable link for this reel."}
      >
        {createdUrl ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 bg-[#F7F6F3] rounded-sm text-sm text-[#1A1A1A] truncate font-mono">
                {createdUrl}
              </div>
              <button
                onClick={handleCopy}
                className="p-3 bg-[#F7F6F3] rounded-sm hover:bg-[#EEEDEA] transition-colors"
              >
                {copied ? (
                  <Check size={16} className="text-emerald-600" />
                ) : (
                  <Copy size={16} className="text-[#999]" />
                )}
              </button>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleClose} variant="ghost">
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4">
            <ContactAutocomplete
              onSelect={handleContactSelect}
              onClear={handleContactClear}
              selectedContact={selectedContact}
            />
            {!selectedContact && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  id="recipientEmail"
                  label="Email"
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="sarah@bbh.com"
                />
                <Input
                  id="recipientCompany"
                  label="Company"
                  value={recipientCompany}
                  onChange={(e) => setRecipientCompany(e.target.value)}
                  placeholder="BBH"
                />
              </div>
            )}
            <Input
              id="expires"
              label="Expires in (days)"
              type="number"
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value)}
              placeholder="30"
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Create Link
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
