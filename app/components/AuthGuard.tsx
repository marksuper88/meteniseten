'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function check() {
      const { data } = await supabase.auth.getSession()

      const session = data.session

      // publieke route(s)
      const isPublic = pathname === '/'

      if (!session && !isPublic) {
        router.replace('/login')
        return
      }

      setChecking(false)
    }

    check()
  }, [pathname, router])

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    )
  }

  return <>{children}</>
}