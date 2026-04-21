"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import BulkUploadModal from "./bulk-upload-modal";
import GlobalExportButton from "./global-export-button";

export default function BulkOperationsWrapper() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <GlobalExportButton />
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
      >
        <Upload className="h-4 w-4 text-brand-600" />
        Bulk Upload
      </button>
      <BulkUploadModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
