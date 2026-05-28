'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      setLoading(false)
    }

    getUser()
  }, [])

  const isLoggedIn = !!user

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-100">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-100 flex items-center justify-center p-6">

      <div className="grid grid-rows-5 gap-6 w-full max-w-3xl">

        {/* ❌ NOT LOGGED IN */}
        {!isLoggedIn && (
          <div className="border-2 border-blue-500 rounded-xl p-6 bg-white flex flex-col items-center justify-center">
            <p className="mb-4 font-semibold">Bekijk de modules</p>
            <Link
              href="/modules"
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-blue-400 transition"
            >
              Open
            </Link>
          </div>
        )}

        {/* ✅ LOGGED IN */}
        {isLoggedIn && (
          <>
            <div className="border-2 border-blue-500 rounded-xl p-6 bg-white flex flex-col items-center justify-center">
              <p className="mb-4 font-semibold">Mijn voeding</p>
              <Link href="/my-intake" className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-blue-400 transition">
                Open
              </Link>
            </div>

            <div className="border-2 border-blue-500 rounded-xl p-6 bg-white flex flex-col items-center justify-center">
              <p className="mb-4 font-semibold">Mijn activiteit</p>
              <Link href="/my-activity" className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-blue-400 transition">
                Open
              </Link>
            </div>

            <div className="border-2 border-blue-500 rounded-xl p-6 bg-white flex flex-col items-center justify-center">
              <p className="mb-4 font-semibold">Mijn gewicht</p>
              <Link href="/my-weight" className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-blue-400 transition">
                Open
              </Link>
            </div>

            <div className="border-2 border-blue-500 rounded-xl p-6 bg-white flex flex-col items-center justify-center">
              <p className="mb-4 font-semibold">Mijn overzicht</p>
              <Link href="/my-overview" className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-blue-400 transition">
                Open
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  )
}