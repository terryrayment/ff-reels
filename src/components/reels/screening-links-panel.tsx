"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, Copy, Check, Eye, ExternalLink, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { ContactAutocomplete } from "@/components/contacts/contact-autocomplete";
import { timeAgo } from "@/lib/utils";

interface SelectedContact {
  id: string;
  name: string;
  email: string;
  role: string | null;
  company: { id: string; name: string } | null;
}

interface ScreeningLinkData {
  id: string;
  token: string;
  isActive: boolean;
  recipientName: string | null;
  recipientEmail: string | null;
  recipientCompany: string | null;
  expiresAt: string | null;
  createdAt: string;
  _count: { views: number };
}

interface ScreeningLinksPanelProps {
  reelId: string;
  links: ScreeningLinkData[];
  screeningDomain: string;
}

export function ScreeningLinksPanel({ reelId, links, screeningDomain }: ScreeningLinksPanelProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createdUrl, setCreatedUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientCompany, setRecipientCompany] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("30");
  const [resendFrom, setResendFrom] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<SelectedContact | null>(null);
  const router = useRouter();

  const openFresh = () => {
    setRecipientName("");
    setRecipientEmail("");
    setRecipientCompany("");
    setExpiresInDays("30");
    setResendFrom(null);
    setSelectedContact(null);
    setCreatedUrl("");
    setCopied(false);
    setOpen(true);
  };

  const openResend = (link: ScreeningLinkData) => {
    setRecipientName(link.recipientName || "");
    setRecipientEmail(link.recipientEmail || "");
    setRecipientCompany(link.recipientCompany || "");
    setExpiresInDays("30");
    setResendFrom(link.recipientName || link.recipientEmail || "this recipient");
    setSelectedContact(null);
    setCreatedUrl("");
    setCopied(false);
    setOpen(true);
  };

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
    setResendFrom(null);
    setSelectedContact(null);
    setCopied(false);
  };

  return (
    <div className="mt-10 md:mt-16">
      <div className="flex items-center justify-between mb-4 md:mb-5">
        <h2 className="text-[10px] text-[#999] uppercase tracking-wider">
          Screening Links ({links.length})
        </h2>
        <Button onClick={openFresh} size="sm" variant="secondary">
          <Link2 size={14} />
          Create Link
        </Button>
      </div>

      {links.length > 0 ? (
        <div className="divide-y divide-[#E8E8E3]/60">
          {links.map((link) => {
            const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date();
            const isInactive = !link.isActive;

            return (
              <div
                key={link.id}
                className="flex items-center justify-between py-3 md:py-3.5 gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-[#1A1A1A] truncate">
                    {link.recipientName || link.recipientEmail || "Untitled link"}
                  </p>
                  <p className="text-[11px] text-[#999] truncate">
                    {link.recipientCompany || "\u2014"} · {timeAgo(link.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                  <span className="flex items-center gap-1 text-[11px] text-[#bbb]">
                    <Eye size={10} />
                    {link._count.views}
                  </span>
                  {isExpired ? (
                    <span className="text-[10px] text-red-400 uppercase tracking-wider">Expired</span>
                  ) : isInactive ? (
                    <span className="text-[10px] text-red-400 uppercase tracking-wider">Disabled</span>
                  ) : (
                    <span className="text-[10px] text-emerald-500 uppercase tracking-wider">Active</span>
                  )}
                  {/* Send Again button */}
                  <button
                    onClick={() => openResend(link)}
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] text-[#999] hover:text-[#1A1A1A] hover:bg-[#F7F6F3] transition-all"
                    title="Send again to this recipient"
                  >
                    <RotateCcw size={10} />
                    <span className="hidden md:inline">Resend</span>
                  </button>
                  <a
                    href={`${screeningDomain}/s/${link.token}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#ccc] hover:text-[#666] transition-colors"
                    title="Open screening link"
                  >
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-[13px] text-[#999]">
            No screening links yet. Create one to share this reel.
          </p>
        </div>
      )}

      {/* Create / Resend Modal */}
      <Modal
        open={open}
        onClose={handleClose}
        title={
          createdUrl
            ? "Link Created"
            : resendFrom
            ? `Resend to ${resendFrom}`
            : "Create Screening Link"
        }
        description={
          createdUrl
            ? "Share this link with the recipient."
            : resendFrom
            ? "A fresh link will be created for this recipient."
            : "Generate a trackable link for this reel."
        }
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
            {!resendFrom ? (
              <ContactAutocomplete
                onSelect={handleContactSelect}
                onClear={handleContactClear}
                selectedContact={selectedContact}
              />
            ) : (
              <Input
                id="recipientName"
                label="Recipient Name"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Sarah at BBH"
              />
            )}
            {!selectedContact && (
              <div className="grid grid-cols-2 gap-3">
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
                {resendFrom ? "Create New Link" : "Create Link"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
