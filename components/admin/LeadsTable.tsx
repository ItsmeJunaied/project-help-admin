"use client";

import { useState } from "react";
import { Paperclip } from "lucide-react";
import { LEAD_STATUSES, type Lead, type LeadStatus } from "@/lib/types";

export function LeadsTable({ leads: initialLeads }: { leads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [filter, setFilter] = useState<string>("ALL");

  async function updateStatus(id: string, status: LeadStatus) {
    setLeads((current) => current.map((lead) => (lead.id === id ? { ...lead, status } : lead)));

    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  const visibleLeads = filter === "ALL" ? leads : leads.filter((lead) => lead.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-heading">Leads</h1>
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="rounded-lg border border-line/10 bg-surface px-3 py-2 text-sm text-heading focus:border-accent focus:outline-none"
        >
          <option value="ALL">All statuses</option>
          {LEAD_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 space-y-4">
        {visibleLeads.length === 0 && (
          <p className="rounded-2xl border border-line/10 bg-surface p-6 text-center text-body">
            No leads match this filter.
          </p>
        )}

        {visibleLeads.map((lead) => (
          <div key={lead.id} className="rounded-2xl border border-line/10 bg-surface p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-bold text-heading">{lead.name}</p>
                <a href={`mailto:${lead.email}`} className="text-sm text-accent hover:underline">
                  {lead.email}
                </a>
                {lead.phone && <p className="text-sm text-body">{lead.phone}</p>}
              </div>

              <select
                value={lead.status}
                onChange={(event) => updateStatus(lead.id, event.target.value as LeadStatus)}
                className="rounded-lg border border-line/10 bg-surface-2 px-3 py-1.5 text-sm text-heading focus:border-accent focus:outline-none"
              >
                {LEAD_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-body">
              {lead.company && <span>Company: {lead.company}</span>}
              {lead.service && <span>Service: {lead.service}</span>}
              {lead.budget && <span>Budget: {lead.budget}</span>}
              {lead.utmSource && <span>UTM source: {lead.utmSource}</span>}
              <span>{new Date(lead.createdAt).toLocaleString("en-US")}</span>
            </div>

            <p className="mt-3 whitespace-pre-wrap text-sm text-body">{lead.message}</p>

            {lead.attachments && lead.attachments.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {lead.attachments.map((attachment, index) => (
                  <a
                    key={attachment.url + index}
                    href={attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-line/10 bg-surface-2 px-3 py-1 text-xs font-medium text-accent hover:border-accent"
                  >
                    <Paperclip aria-hidden size={12} />
                    {attachment.fileName ?? `Attachment ${index + 1}`}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
