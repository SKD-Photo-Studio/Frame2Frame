'use client'

import { useEffect } from 'react'
import { AlertOctagon, RefreshCcw, Home, MessageSquare } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] p-4 relative overflow-hidden">
      {/* Equipment Background Overlay */}
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
              <div className="absolute top-0 right-0 w-12 h-12 border-4 border-red-500/20 rounded-2xl bg-white/50" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-4 border-gray-900 rounded-2xl bg-white shadow-xl flex items-center justify-center">
                <AlertOctagon className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-3">
            Frame2Frame
          </h1>
          <p className="text-gray-500 text-sm font-bold uppercase tracking-[0.6em] mb-10">
            System Breakdown
          </p>
        </div>

        {/* Error Message Card */}
        <div className="bg-[#121212]/95 backdrop-blur-2xl border border-white/10 rounded-[40px] p-12 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.4)] relative overflow-hidden max-w-lg mx-auto">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-orange-600 to-red-500" />
          
          <div className="space-y-8">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
                <AlertOctagon className="w-10 h-10 text-red-500" />
              </div>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-white mb-4">Something went wrong</h3>
              <p className="text-gray-400 leading-relaxed text-lg">
                The application encountered an unexpected error. Don't worry, your data is safe.
              </p>
              {error.digest && (
                <p className="mt-4 text-white/20 text-xs font-mono">
                  Error ID: {error.digest}
                </p>
              )}
            </div>

            <div className="pt-6 flex flex-col gap-3">
              <button
                onClick={() => reset()}
                className="w-full bg-white text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-200 transition-all active:scale-95 shadow-lg"
              >
                <RefreshCcw className="w-5 h-5" />
                Try Again
              </button>
              
              <div className="flex gap-3">
                <button
                  onClick={() => window.location.href = '/'}
                  className="flex-1 bg-white/5 text-white font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all border border-white/10"
                >
                  <Home className="w-4 h-4" />
                  Home
                </button>
                <button
                  onClick={() => window.open('mailto:support@frame2frame.studio')}
                  className="flex-1 bg-white/5 text-white font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all border border-white/10"
                >
                  <MessageSquare className="w-4 h-4" />
                  Support
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-12 text-gray-400 text-sm font-medium animate-fade-in opacity-60">
          If the issue persists, please contact the studio administrator.
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
