"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Modal from "@/components/ui/modal";
import { api, TeamListItem } from "@/lib/api";

const ROLES = [
  "Traditional Photographer",
  "Traditional Videographer",
  "Cinematographer",
  "Candid Photographer",
  "Assistant",
  "Choreographer",
  "Director",
  "Editor",
];

export default function AddTeamMemberButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 sm:w-auto"
      >
        <Plus className="h-4 w-4" />
        Add Member
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Add Team Member">
        <AddTeamMemberForm onSuccess={() => setOpen(false)} />
      </Modal>
    </>
  );
}

export function AddTeamMemberForm({ onSuccess }: { onSuccess: (m?: TeamListItem) => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const data = {
      full_name: fd.get("full_name") as string,
      usual_role: fd.get("usual_role") as string,
      phone_number: fd.get("phone_number") as string,
    };

    if (!data.full_name.trim() || !data.usual_role) {
      setError("Name and role are required.");
      setLoading(false);
      return;
    }

    try {
      const newMember = await api.team.create(data);
      router.refresh();
      onSuccess(newMember);
    } catch {
      setError("Failed to add team member. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="form-label">Name *</label>
        <input
          name="full_name"
          placeholder="e.g. Suresh Kumar"
          className="form-input"
        />
      </div>

      <div>
        <label className="form-label">Usual Role *</label>
        <select
          name="usual_role"
          className="form-select"
        >
          <option value="">Select a role...</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="form-label">Phone Number</label>
        <input
          name="phone_number"
          type="tel"
          placeholder="e.g. 9001122334"
          className="form-input"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => onSuccess()}
          className="form-btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700 shadow-lg shadow-brand-600/20 disabled:opacity-50 transition-all"
        >
          {loading ? "Adding..." : "Add Member"}
        </button>
      </div>
    </form>
  );
}
