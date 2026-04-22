"use client";

import React, { useState } from "react";
import imageCompression from "browser-image-compression";
import { Upload, X, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface LogoUploadProps {
  currentLogoUrl?: string | null;
  onUploadComplete: (url: string) => void;
}

export default function LogoUpload({ currentLogoUrl, onUploadComplete }: LogoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentLogoUrl || null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // 1. Compression
      const options = {
        maxSizeMB: 0.1, // 100KB
        maxWidthOrHeight: 500,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);
      console.log(`Original: ${file.size / 1024}KB, Compressed: ${compressedFile.size / 1024}KB`);

      // 2. Convert to Base64 for transport
      const base64 = await imageCompression.getDataUrlFromFile(compressedFile);

      // 3. Upload to Backend -> Supabase Storage
      const { url } = await api.tenant.uploadLogo(base64);
      
      setPreview(url);
      onUploadComplete(url);
      setUploading(false);

    } catch (err) {
      console.error(err);
      setError("Failed to compress or upload image.");
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
          {preview ? (
            <>
              <img src={preview} alt="Logo Preview" className="h-full w-full object-contain" />
              <button
                onClick={() => {
                  setPreview(null);
                  onUploadComplete("");
                }}
                className="absolute -right-1 -top-1 rounded-full bg-red-500 p-0.5 text-white shadow-sm hover:bg-red-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <Upload className="h-8 w-8 text-gray-400" />
          )}
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Company Logo</label>
          <p className="text-xs text-gray-500 mb-2">Max 100KB, 500x500px (Auto-compressed)</p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
            disabled={uploading}
          />
        </div>
      </div>

      {uploading && (
        <div className="flex items-center gap-2 text-sm text-brand-600 animate-pulse">
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing & Uploading...
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {!uploading && !error && preview && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          Logo ready!
        </div>
      )}
    </div>
  );
}
