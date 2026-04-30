"use client";

import { useState } from "react";
import { FileSpreadsheet, Download } from "lucide-react";
import { api } from "@/lib/api";
import { createClient } from "@/lib/supabase.client";

export default function GlobalExportButton() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleExport() {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const blob = await api.bulk.exportAll(token);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Frame2Frame_Global_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to export report.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors opacity-80 hover:opacity-100 disabled:opacity-50"
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
    >
      <FileSpreadsheet className="h-4 w-4 text-green-600" />
      {loading ? "Exporting..." : "Download Report"}
    </button>
  );
}
