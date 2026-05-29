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
          <div className="border-1 border-blue-500 rounded-xl p-6 bg-white flex flex-col items-center justify-center">
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

            {/* ===================== */}
            {/* MIJN VOEDING */}
            {/* ===================== */}

            <div className="border-1 border-blue-500 rounded-xl p-6 bg-white">
              <p className="mb-4 font-semibold text-center text-lg">
                Mijn voeding
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* TILE 1 */}
                <Link
                  href="/my-intake"
                  className="border-1 border-blue-500 rounded-2xl p-4 bg-orange-100 hover:shadow-lg transition flex flex-col items-center"
                >
                  <p className="mb-3 font-semibold">Mijn inname</p>

                  {/* FIXED IMAGE */}
                  <div className="w-full flex justify-center">
                    <img
                      src="https://frxvdjqqsgdynkktbvim.supabase.co/storage/v1/object/public/layout/bord2.png"
                      alt="Mijn inname"
                      className="w-1/2 h-auto object-contain"
                    />
                  </div>
                </Link>

                {/* TILE 2 */}
                <Link
                  href="/my-nutrition"
                  className="border-1 border-blue-500 rounded-2xl p-4 bg-orange-100 hover:shadow-lg transition flex flex-col items-center"
                >
                  <p className="mb-3 font-semibold">
                    Mijn voedingswaarden dashboard
                  </p>

                  {/* FIXED IMAGE */}
                  <div className="w-full flex justify-center">
                    <img
                      src="https://frxvdjqqsgdynkktbvim.supabase.co/storage/v1/object/public/layout/board.png"
                      alt="Mijn voedingswaarden dashboard"
                      className="w-1/2 h-auto object-contain"
                    />
                  </div>
                </Link>

              </div>
            </div>

            {/* ACTIVITY */}
            <div className="border-1 border-blue-500 rounded-xl p-6 bg-white flex flex-col items-center justify-center">
              <p className="mb-4 font-semibold">Mijn activiteit</p>
              <Link href="/my-activity" className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-400 transition">
                Activiteit registreren
              </Link>
            </div>

            {/* WEIGHT */}
            <div className="border-1 border-blue-500 rounded-xl p-6 bg-white flex flex-col items-center justify-center">
              <p className="mb-4 font-semibold">Mijn gewicht</p>
              <Link href="/my-weight" className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-400 transition">
                Open
              </Link>
            </div>

            {/* OVERVIEW */}
            <div className="border-1 border-blue-500 rounded-xl p-6 bg-white flex flex-col items-center justify-center">
              <p className="mb-4 font-semibold">Mijn overzicht</p>
              <Link href="/my-overview" className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-400 transition">
                Open
              </Link>
            </div>

          </>
        )}

      </div>
    </div>
  )
}