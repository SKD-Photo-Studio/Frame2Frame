'use client'

import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase.client'
import { LogIn, Mail, Lock, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react'
import { api } from '@/lib/api'

function LoginFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('returnTo') || '/'
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tenant, setTenant] = useState<any>(null)

  useEffect(() => {
    // Fetch tenant info for branding
    api.tenant.get().then(setTenant).catch(console.error)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        throw new Error(authError.message)
      }

      router.push(returnTo)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] p-4 relative overflow-hidden">
      {/* Equipment Background Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-40 grayscale-[0.5] mix-blend-multiply"
        style={{ 
          backgroundImage: 'url("/images/login-bg.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Decorative Gradient Overlay */}
      <div className="absolute inset-0 z-1 bg-gradient-to-tr from-white/60 via-transparent to-white/40 pointer-events-none" />

      <div className="w-full max-w-md relative z-10 font-[family-name:var(--font-outfit)]">
        {/* New Header Hierarchy */}
        <div className="text-center mb-8 animate-fade-in">
          {/* Double Frame Icon */}
          <div className="flex justify-center mb-4">
            <div className="relative w-10 h-10">
              <div className="absolute top-0 right-0 w-7 h-7 border-2 border-gray-900 rounded-lg bg-white/50" />
              <div className="absolute bottom-0 left-0 w-7 h-7 border-2 border-gray-900 rounded-lg bg-white shadow-sm" />
            </div>
          </div>

          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-2">
            Frame2Frame
          </h1>
          <p className="text-gray-500 text-sm font-bold uppercase tracking-[0.4em] mb-8">
            Internal Portal
          </p>

          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="h-px w-16 bg-gray-200" />
            <div className="flex items-center gap-4">
              {tenant?.logo_url && (
                <img 
                  src={tenant.logo_url} 
                  alt="" 
                  className="h-12 w-auto object-contain"
                />
              )}
              <h2 className="text-lg font-medium text-gray-700">
                Made for <span className="text-black font-bold">{tenant?.company_name || 'SKD Photo Studio'}</span>
              </h2>
            </div>
            <div className="h-px w-16 bg-gray-200" />
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-[#121212]/95 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600" />
          
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm animate-shake">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium"
                  placeholder="admin@skdphotostudio.in"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-bold rounded-2xl shadow-xl shadow-blue-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-lg mt-4"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In to Studio
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-shake {
          animation: shake 0.2s cubic-bezier(.36,.07,.19,.97) both;
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  )
}
