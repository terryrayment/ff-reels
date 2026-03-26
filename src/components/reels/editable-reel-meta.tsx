"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Pencil, Check, X } from "lucide-react";

interface EditableReelMetaProps {
  reelId: string;
  initialBrand: string | null;
  initialAgencyName: string | null;
  initialCampaignName: string | null;
  initialProducer: string | null;
}

export function EditableReelMeta({
  reelId,
  initialBrand,
  initialAgencyName,
  initialCampaignName,
  initialProducer,
}: EditableReelMetaProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [brand, setBrand] = useState(initialBrand || "");
  const [agencyName, setAgencyName] = useState(initialAgencyName || "");
  const [campaignName, setCampaignName] = useState(initialCampaignName || "");
  const [producer, setProducer] = useState(initialProducer || "");

  const [dBrand, setDBrand] = useState(brand);
  const [dAgency, setDAgency] = useState(agencyName);
  const [dCampaign, setDCampaign] = useState(campaignName);
  const [dProducer, setDProducer] = useState(producer);

  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      firstInputRef.current?.focus();
    }
  }, [isEditing]);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/reels/${reelId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: dBrand.trim(),
          agencyName: dAgency.trim(),
          campaignName: dCampaign.trim(),
          producer: dProducer.trim(),
        }),
      });

      if (res.ok) {
        setBrand(dBrand.trim());
        setAgencyName(dAgency.trim());
        setCampaignName(dCampaign.trim());
        setProducer(dProducer.trim());
      } else {
        // revert
        setDBrand(brand);
        setDAgency(agencyName);
        setDCampaign(campaignName);
        setDProducer(producer);
      }
    } catch {
      setDBrand(brand);
      setDAgency(agencyName);
      setDCampaign(campaignName);
      setDProducer(producer);
    } finally {
      setSaving(false);
      setIsEditing(false);
    }
  }, [dBrand, dAgency, dCampaign, dProducer, brand, agencyName, campaignName, producer, reelId]);

  const cancel = () => {
    setDBrand(brand);
    setDAgency(agencyName);
    setDCampaign(campaignName);
    setDProducer(producer);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      save();
    } else if (e.key === "Escape") {
      cancel();
    }
  };

  const hasAny = brand || agencyName || campaignName || producer;

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <input
          ref={firstInputRef}
          type="text"
          placeholder="Brand"
          value={dBrand}
          onChange={(e) => setDBrand(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={saving}
          className="w-28 px-2 py-1 text-[11px] text-[#1A1A1A] bg-white border border-[#E8E7E3] rounded-md focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]/20 placeholder:text-[#ccc]"
        />
        <input
          type="text"
          placeholder="Agency"
          value={dAgency}
          onChange={(e) => setDAgency(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={saving}
          className="w-28 px-2 py-1 text-[11px] text-[#1A1A1A] bg-white border border-[#E8E7E3] rounded-md focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]/20 placeholder:text-[#ccc]"
        />
        <input
          type="text"
          placeholder="Campaign"
          value={dCampaign}
          onChange={(e) => setDCampaign(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={saving}
          className="w-28 px-2 py-1 text-[11px] text-[#1A1A1A] bg-white border border-[#E8E7E3] rounded-md focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]/20 placeholder:text-[#ccc]"
        />
        <input
          type="text"
          placeholder="Producer"
          value={dProducer}
          onChange={(e) => setDProducer(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={saving}
          className="w-28 px-2 py-1 text-[11px] text-[#1A1A1A] bg-white border border-[#E8E7E3] rounded-md focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]/20 placeholder:text-[#ccc]"
        />
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="text-[#999] hover:text-emerald-600 transition-colors p-1"
          title="Save"
        >
          <Check size={14} />
        </button>
        <button
          type="button"
          onClick={cancel}
          className="text-[#999] hover:text-red-500 transition-colors p-1"
          title="Cancel"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className="group flex items-center gap-4 mt-3 text-[11px] text-[#999] text-left"
      title="Click to edit metadata"
    >
      {hasAny ? (
        <>
          {brand && <span>{brand}</span>}
          {agencyName && (
            <>
              <span className="text-[#ddd]">·</span>
              <span>{agencyName}</span>
            </>
          )}
          {campaignName && (
            <>
              <span className="text-[#ddd]">·</span>
              <span>{campaignName}</span>
            </>
          )}
          {producer && (
            <>
              <span className="text-[#ddd]">·</span>
              <span>Prod: {producer}</span>
            </>
          )}
        </>
      ) : (
        <span className="text-[#ccc] italic">Add brand, agency, campaign, producer...</span>
      )}
      <Pencil
        size={10}
        className="text-[#ccc] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
      />
    </button>
  );
}
