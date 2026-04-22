'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase.client'
import Sidebar from '@/components/layout/sidebar'

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [session, setSession] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const isLoginPage = pathname === '/login'

  useEffect(() => {
    setMounted(true)
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // If on login page or not logged in, don't show sidebar and remove main margin/padding
  const showSidebar = mounted && !isLoginPage && !!session

  return (
    <>
      {showSidebar && <Sidebar />}
      <main className={`min-h-screen ${showSidebar ? 'pt-14 pb-20 md:ml-64 md:pt-0 md:pb-0' : ''}`}>
        <div className={showSidebar ? 'px-4 py-4 sm:px-6 md:px-8 md:py-6' : ''}>
          {children}
        </div>
      </main>
    </>
  )
}
