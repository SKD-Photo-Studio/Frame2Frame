"use client";

import React, { useState, useEffect } from "react";
import { api, TenantResponse } from "@/lib/api";
import LogoUpload from "@/components/ui/logo-upload";
import { Save, Loader2, Building2, ShieldCheck, Mail } from "lucide-react";

export default function SettingsPage() {
  const [tenant, setTenant] = useState<TenantResponse | null>(null);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tenantData, adminsData] = await Promise.all([
        api.tenant.get(),
        api.tenant.listAdmins()
      ]);
      setTenant(tenantData);
      setAdmins(adminsData);
    } catch (error) {
      console.error("Failed to fetch settings data:", error);
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
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Building2 className="h-6 w-6 text-brand-600" />
          Workspace Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your organization&apos;s branding and identity.
        </p>
      </div>

      <div className="space-y-6">
        {/* Branding Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Branding</h2>
          </div>
          <form onSubmit={handleUpdate} className="p-6 space-y-8">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Company Name</label>
              <input
                type="text"
                value={tenant?.company_name || ""}
                onChange={(e) => setTenant(prev => prev ? { ...prev, company_name: e.target.value } : null)}
                placeholder="e.g. SKD Photo Studio"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                required
              />
            </div>

            <hr className="border-gray-100" />

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

        {/* Admins Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-600" />
              Administrators
            </h2>
          </div>
          <div className="p-6">
            <div className="grid gap-4">
              {admins.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 bg-gray-50/30">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold">
                      {admin.full_name?.charAt(0) || "A"}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{admin.full_name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                        <Mail className="h-3 w-3" />
                        {admin.email}
                      </div>
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700 border border-brand-100">
                    Full Access
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-6 text-center italic">
              Administrators have full access to workspace settings, financials, and team management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
