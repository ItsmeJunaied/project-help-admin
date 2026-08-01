"use client";

import { useState } from "react";
import { FileText, Link as LinkIcon } from "lucide-react";
import { APPLICATION_STATUSES, type ApplicationStatus, type JobApplication } from "@/lib/types";

export function ApplicationsTable({ applications: initial }: { applications: JobApplication[] }) {
  const [applications, setApplications] = useState(initial);

  async function updateStatus(id: string, status: ApplicationStatus) {
    setApplications((current) => current.map((app) => (app.id === id ? { ...app, status } : app)));

    await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-heading">Job Applications</h1>

      <div className="mt-6 space-y-4">
        {applications.length === 0 && (
          <p className="rounded-2xl border border-line/10 bg-surface p-6 text-center text-body">
            No applications yet.
          </p>
        )}

        {applications.map((app) => (
          <div key={app.id} className="rounded-2xl border border-line/10 bg-surface p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-bold text-heading">{app.name}</p>
                <p className="text-sm text-body">Applied for: {app.jobTitle}</p>
                <a href={`mailto:${app.email}`} className="text-sm text-accent hover:underline">
                  {app.email}
                </a>
              </div>

              <select
                value={app.status}
                onChange={(event) => updateStatus(app.id, event.target.value as ApplicationStatus)}
                className="rounded-lg border border-line/10 bg-surface-2 px-3 py-1.5 text-sm text-heading focus:border-accent focus:outline-none"
              >
                {APPLICATION_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
              {app.resumeUrl && (
                <a
                  href={app.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-accent hover:underline"
                >
                  <FileText aria-hidden size={14} />
                  Resume
                </a>
              )}
              {app.portfolioUrl && (
                <a
                  href={app.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-accent hover:underline"
                >
                  <LinkIcon aria-hidden size={14} />
                  Portfolio
                </a>
              )}
              <span className="text-body">
                {new Date(app.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            {app.coverLetter && <p className="mt-3 whitespace-pre-wrap text-sm text-body">{app.coverLetter}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
