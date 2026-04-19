"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Modal from "@/components/ui/modal";
import { api, ClientListItem } from "@/lib/api";

export default function AddClientButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 sm:w-auto"
      >
        <Plus className="h-4 w-4" />
        Add Client
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Add New Client">
        <AddClientForm onSuccess={() => setOpen(false)} />
      </Modal>
    </>
  );
}

export function AddClientForm({ onSuccess }: { onSuccess: (c?: ClientListItem) => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const data = {
      client_name: fd.get("client_name") as string,
      phone_number: fd.get("phone_number") as string,
      email: fd.get("email") as string,
      notes: fd.get("notes") as string,
    };

    if (!data.client_name.trim() || !data.phone_number.trim()) {
      setError("Name and phone are required.");
      setLoading(false);
      return;
    }

    try {
      const newClient = await api.clients.create(data);
      router.refresh();
      onSuccess(newClient);
    } catch {
      setError("Failed to create client. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Client Name *" name="client_name" placeholder="e.g. Rahul Sharma" />
      <Field label="Phone Number *" name="phone_number" placeholder="e.g. 9876543210" type="tel" />
      <Field label="Email" name="email" placeholder="e.g. rahul@gmail.com" type="email" />
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          name="notes"
          rows={2}
          placeholder="Optional notes..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => onSuccess()}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Client"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
    </div>
  );
}
