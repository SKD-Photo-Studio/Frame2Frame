"use client";

import React, { useState, useEffect } from "react";
import { api, TenantResponse } from "@/lib/api";
import LogoUpload from "@/components/ui/logo-upload";
import { Save, Loader2, Building2 } from "lucide-react";

export default function SettingsPage() {
  const [tenant, setTenant] = useState<TenantResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchTenant();
  }, []);

  const fetchTenant = async () => {
    try {
      const data = await api.tenant.get();
      setTenant(data);
    } catch (error) {
      console.error("Failed to fetch tenant:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;

    try {
      setSaving(true);
      setSuccess(false);
      await api.tenant.update({
        company_name: tenant.company_name,
        logo_url: tenant.logo_url,
      });
      setSuccess(true);
      // Refresh sidebar branding by triggering a window event or similar 
      // (In a real app, you'd use a Global State / Context)
      window.location.reload(); 
    } catch (error) {
      console.error("Failed to update tenant:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Building2 className="h-6 w-6 text-brand-600" />
          Workspace Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your organization&apos;s branding and identity.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <form onSubmit={handleUpdate} className="p-6 space-y-8">
          {/* Company Name */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Company Name</label>
            <input
              type="text"
              value={tenant?.company_name || ""}
              onChange={(e) => setTenant(prev => prev ? { ...prev, company_name: e.target.value } : null)}
              placeholder="e.g. SKD Studios"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              required
            />
          </div>

          <hr className="border-gray-100" />

          {/* Logo Upload */}
          <LogoUpload 
            currentLogoUrl={tenant?.logo_url} 
            onUploadComplete={(url) => setTenant(prev => prev ? { ...prev, logo_url: url } : null)} 
          />

          <div className="pt-4 flex items-center justify-between border-t border-gray-100">
            {success && (
              <p className="text-sm font-medium text-green-600">Settings saved successfully!</p>
            )}
            <button
              type="submit"
              disabled={saving}
              className="ml-auto flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-brand-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
