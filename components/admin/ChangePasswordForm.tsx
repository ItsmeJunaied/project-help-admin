"use client";

import { useState, type FormEvent } from "react";
import { toast } from "@/lib/toast";

export function ChangePasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    const currentPassword = String(formData.get("currentPassword") ?? "");
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (newPassword.length < 8) {
      toast({ title: "Password too short", description: "Use at least 8 characters.", variant: "error" });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", description: "Re-enter the new password.", variant: "error" });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/settings/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message ?? "Couldn't change password");

      toast({ title: "Password updated" });
      formElement.reset();
    } catch (error) {
      toast({
        title: "Couldn't change password",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div>
        <label htmlFor="currentPassword" className="block text-sm font-medium text-heading">
          Current password
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className="mt-2 w-full rounded-lg border border-line/10 bg-surface-2 px-4 py-2.5 text-heading focus:border-accent focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-heading">
          New password
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-2 w-full rounded-lg border border-line/10 bg-surface-2 px-4 py-2.5 text-heading focus:border-accent focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-heading">
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-2 w-full rounded-lg border border-line/10 bg-surface-2 px-4 py-2.5 text-heading focus:border-accent focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-on-primary transition-colors hover:bg-secondary disabled:opacity-60"
      >
        {isSubmitting ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}
