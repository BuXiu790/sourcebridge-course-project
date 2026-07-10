"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ErrorAlert } from "@/components/ui/States";
import type { ProfileRow, UserRole } from "@/lib/database.types";

export function RoleManager({
  profiles,
  canEdit,
}: {
  profiles: ProfileRow[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [pendingEmail, setPendingEmail] = useState<string>();
  const [error, setError] = useState<string>();

  async function updateRole(email: string, role: UserRole) {
    setError(undefined);
    setPendingEmail(email);
    try {
      const response = await fetch("/api/admin/profiles/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "The role could not be updated.");
      router.refresh();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "The role could not be updated.");
    } finally {
      setPendingEmail(undefined);
    }
  }

  return (
    <section className="panel overflow-hidden" aria-labelledby="users-heading">
      <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
        <h2 id="users-heading" className="text-lg font-bold text-slate-950">User profiles and roles</h2>
        <p className="mt-1 text-sm text-slate-500">
          Operators can view profiles. Only admins can change roles.
        </p>
      </div>
      {error ? <div className="p-5"><ErrorAlert message={error} /></div> : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr><th className="px-6 py-3.5">User</th><th className="px-4 py-3.5">Role</th><th className="px-4 py-3.5">Created</th><th className="px-6 py-3.5 text-right">Action</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {profiles.map((profile) => (
              <tr key={profile.id}>
                <td className="px-6 py-4"><p className="font-semibold text-slate-900">{profile.full_name || "Unnamed user"}</p><p className="mt-1 text-xs text-slate-500">{profile.email}</p></td>
                <td className="px-4 py-4 capitalize text-slate-700">{profile.role}</td>
                <td className="px-4 py-4 text-slate-600">{new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(profile.created_at))}</td>
                <td className="px-6 py-4 text-right">
                  {canEdit ? (
                    <div className="inline-flex items-center gap-2">
                      <select
                        aria-label={`Role for ${profile.email}`}
                        defaultValue={profile.role}
                        className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
                        id={`role-${profile.id}`}
                      >
                        <option value="buyer">Buyer</option><option value="operator">Operator</option><option value="admin">Admin</option>
                      </select>
                      <Button
                        variant="secondary"
                        disabled={pendingEmail === profile.email}
                        onClick={() => {
                          const field = document.getElementById(`role-${profile.id}`) as HTMLSelectElement | null;
                          if (field) void updateRole(profile.email, field.value as UserRole);
                        }}
                      >
                        Save
                      </Button>
                    </div>
                  ) : <span className="text-xs text-slate-500">Read only</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
