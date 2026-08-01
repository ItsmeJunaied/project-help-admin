import { ChangePasswordForm } from "@/components/admin/ChangePasswordForm";

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-heading">Settings</h1>

      <div className="mt-6 max-w-md rounded-2xl border border-line/10 bg-surface p-6">
        <h2 className="text-lg font-bold text-heading">Change password</h2>
        <p className="mt-1 text-sm text-body">Update the password used to sign in to this dashboard.</p>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
