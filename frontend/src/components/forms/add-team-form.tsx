"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Modal from "@/components/ui/modal";
import { api } from "@/lib/api";

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

function AddTeamMemberForm({ onSuccess }: { onSuccess: () => void }) {
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
      await api.team.create(data);
      router.refresh();
      onSuccess();
    } catch {
      setError("Failed to add team member. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Name *</label>
        <input
          name="full_name"
          placeholder="e.g. Suresh Kumar"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Role *</label>
        <select
          name="usual_role"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 transition-colors focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="">Select a role...</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Phone Number</label>
        <input
          name="phone_number"
          type="tel"
          placeholder="e.g. 9001122334"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onSuccess}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Member"}
        </button>
      </div>
    </form>
  );
}
