"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import Modal from "@/components/ui/modal";
import { api } from "@/lib/api";

interface Props {
  client: {
    id: string;
    client_name: string;
    phone_number: string;
    email: string;
    notes: string;
  };
}

export default function EditClientButton({ client }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:ml-auto"
      >
        <Pencil className="h-3.5 w-3.5" /> Edit
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Edit Client">
        <EditClientForm client={client} onSuccess={() => setOpen(false)} />
      </Modal>
    </>
  );
}

function EditClientForm({ client, onSuccess }: Props & { onSuccess: () => void }) {
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
      await api.clients.update(client.id, data);
      router.refresh();
      onSuccess();
    } catch {
      setError("Failed to update client.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Client Name *" name="client_name" defaultValue={client.client_name} />
      <Field label="Phone Number *" name="phone_number" defaultValue={client.phone_number} type="tel" />
      <Field label="Email" name="email" defaultValue={client.email} type="email" />
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          name="notes"
          rows={2}
          defaultValue={client.notes}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <FormActions loading={loading} label="Save Changes" onCancel={onSuccess} />
    </form>
  );
}

function Field({ label, name, defaultValue, type = "text" }: { label: string; name: string; defaultValue?: string; type?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      <input name={name} type={type} defaultValue={defaultValue} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
    </div>
  );
}

function FormActions({ loading, label, onCancel }: { loading: boolean; label: string; onCancel: () => void }) {
  return (
    <div className="flex justify-end gap-3 pt-2">
      <button type="button" onClick={onCancel} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
      <button type="submit" disabled={loading} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">{loading ? "Saving..." : label}</button>
    </div>
  );
}
