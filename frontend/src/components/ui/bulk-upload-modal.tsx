"use client";

import { useState, useRef } from "react";
import { Download, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import Modal from "./modal";
import { api } from "@/lib/api";
import { createClient } from "@/lib/supabase.client";
import { useRouter } from "next/navigation";

export default function BulkUploadModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleDownloadTemplate() {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const blob = await api.bulk.getTemplate(token);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Frame2Frame_Bulk_Template.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError("Failed to download template.");
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError("");
      setSuccess(null);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const result = await api.bulk.upload(file, token);
      setSuccess(result.stats);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to upload file.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Bulk Operations">
      <div className="space-y-6 py-4">
        {/* Download Section */}
        <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center transition-colors hover:border-brand-300">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Download className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-gray-900">Download Empty Template</h3>
          <p className="mt-1 text-xs text-gray-500">Get a clean Excel file with all headers for fresh uploads.</p>
          <button
            onClick={handleDownloadTemplate}
            disabled={loading}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? "Preparing..." : "Download Template (.xlsx)"}
          </button>
        </div>

        {/* Upload Section */}
        <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center transition-colors hover:border-brand-300">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Upload className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-gray-900">Upload Filled File</h3>
          <p className="mt-1 text-xs text-gray-500">Upload your filled file to bulk-import data to the database.</p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".xlsx, .xls"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Select File"}
          </button>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <p className="font-semibold">Upload Successful!</p>
            </div>
            <ul className="ml-8 space-y-1 list-disc">
              {Object.entries(success).map(([key, val]) => (
                <li key={key} className="capitalize">{key}: {val as number} records</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  );
}
