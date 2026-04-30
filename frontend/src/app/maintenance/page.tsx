'use client'

import { useEffect, useState } from 'react'
import { Hammer, Clock, AlertTriangle, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'

export default function MaintenancePage() {
  const [tenant, setTenant] = useState<any>(null)

  useEffect(() => {
    // Fetch tenant info for branding
    api.tenant.get().then(setTenant).catch(console.error)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] p-4 relative overflow-hidden">
      {/* Equipment Background Overlay (Reusing login style) */}
      <div 
        className="absolute inset-0 z-0 opacity-20 grayscale-[0.5] mix-blend-multiply"
        style={{ 
          backgroundImage: 'url("/images/login-bg.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Decorative Gradient Overlay */}
      <div className="absolute inset-0 z-1 bg-gradient-to-tr from-white/60 via-transparent to-white/40 pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10 font-[family-name:var(--font-outfit)] text-center">
        {/* Logo/Branding section */}
        <div className="mb-12 animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="relative w-16 h-16">
              <div className="absolute top-0 right-0 w-12 h-12 border-4 border-gray-900 rounded-2xl bg-white/50" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-4 border-gray-900 rounded-2xl bg-white shadow-xl flex items-center justify-center">
                <Hammer className="w-6 h-6 text-gray-900" />
              </div>
            </div>
          </div>

          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-3">
            Frame2Frame
          </h1>
          <p className="text-gray-500 text-sm font-bold uppercase tracking-[0.6em] mb-10">
            System Maintenance
          </p>

          <div className="flex flex-col items-center gap-4">
            <div className="h-px w-24 bg-gray-200" />
            <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm py-3 px-6 rounded-2xl border border-gray-100 shadow-sm">
              {tenant?.logo_url && (
                <img 
                  src={tenant.logo_url} 
                  alt="" 
                  className="h-10 w-auto object-contain"
                />
              )}
              <h2 className="text-lg font-medium text-gray-700">
                Updating <span className="text-black font-bold">{tenant?.company_name || 'SKD Photo Studio'}</span>
              </h2>
            </div>
            <div className="h-px w-24 bg-gray-200" />
          </div>
        </div>

        {/* Maintenance Message Card */}
        <div className="bg-[#121212]/95 backdrop-blur-2xl border border-white/10 rounded-[40px] p-12 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.4)] relative overflow-hidden max-w-lg mx-auto">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 via-orange-600 to-amber-500" />
          
          <div className="space-y-8">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20">
                <Clock className="w-10 h-10 text-amber-500 animate-pulse" />
              </div>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-white mb-4">Under Maintenance</h3>
              <p className="text-gray-400 leading-relaxed text-lg">
                We're currently performing scheduled maintenance to improve your experience. 
                <span className="block mt-4 text-amber-500/80 text-base font-semibold">
                  We'll be back online very soon.
                </span>
              </p>
            </div>

            <div className="pt-6 border-t border-white/5">
              <div className="flex items-center justify-center gap-3 text-gray-500 text-sm italic">
                <AlertTriangle className="w-4 h-4" />
                <span>All your data is safe and secured.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-12 text-gray-400 text-sm font-medium animate-fade-in opacity-60">
          Expected completion within 30-60 minutes.
        </p>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  )
}
