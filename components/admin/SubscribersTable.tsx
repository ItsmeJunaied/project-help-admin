"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import type { Subscriber } from "@/lib/types";
import { toast } from "@/lib/toast";

export function SubscribersTable({ subscribers: initialSubscribers }: { subscribers: Subscriber[] }) {
  const [subscribers, setSubscribers] = useState(initialSubscribers);
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function handleRemove(id: string) {
    setRemovingId(id);
    const previous = subscribers;
    setSubscribers((current) => current.filter((subscriber) => subscriber.id !== id));

    try {
      const response = await fetch(`/api/newsletter/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Request failed");
    } catch {
      setSubscribers(previous);
      toast({ title: "Couldn't remove subscriber", description: "Please try again.", variant: "error" });
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-heading">Newsletter</h1>
        <p className="text-sm text-body">
          {subscribers.length} {subscribers.length === 1 ? "subscriber" : "subscribers"}
        </p>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line/10 bg-surface">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line/10 text-xs uppercase tracking-wide text-body">
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Subscribed</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {subscribers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-body">
                  No subscribers yet.
                </td>
              </tr>
            )}
            {subscribers.map((subscriber) => (
              <tr key={subscriber.id} className="border-b border-line/10 last:border-0">
                <td className="px-4 py-3 text-heading">
                  <a href={`mailto:${subscriber.email}`} className="hover:text-accent hover:underline">
                    {subscriber.email}
                  </a>
                </td>
                <td className="px-4 py-3 text-body">{subscriber.source ?? "—"}</td>
                <td className="px-4 py-3 text-body">
                  {new Date(subscriber.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleRemove(subscriber.id)}
                    disabled={removingId === subscriber.id}
                    aria-label={`Remove ${subscriber.email}`}
                    className="text-body hover:text-red-400 disabled:opacity-50"
                  >
                    <Trash2 aria-hidden size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
