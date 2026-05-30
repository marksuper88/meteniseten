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

      <div className="grid gap-3 w-full max-w-4xl mx-auto">

        {/* ❌ NOT LOGGED IN */}
        {!isLoggedIn && (
          <div className="rounded-xl p-6 bg-white shadow-md flex flex-col items-center justify-center">
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

            {/* MIJN VOEDING */}
            <div className="rounded-xl p-4 bg-white shadow-md">
              <h2 className="mb-4 font-bold text-center text-2xl">
                Mijn voeding
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 justify-items-center">

                {/* TILE 0 */}
                <Link
                  href="/my-ingredients"
                  className="w-64 h-64 rounded-2xl p-4 bg-orange-500 hover:shadow-lg transition flex flex-col items-center justify-center"
                >
                  <p className="mb-3 font-semibold text-white text-center">
                    Mijn ingredienten
                  </p>

                  <div className="flex justify-center">
                    <img
                      src="https://frxvdjqqsgdynkktbvim.supabase.co/storage/v1/object/public/layout/ingredients_wit.png"
                      alt="Mijn ingredienten"
                      className="w-32 h-32 object-contain"
                    />
                  </div>
                </Link>

                {/* TILE 1 */}
                <Link
                  href="/my-intake"
                  className="w-64 h-64 rounded-2xl p-4 bg-orange-500 hover:shadow-lg transition flex flex-col items-center justify-center"
                >
                  <p className="mb-3 font-semibold text-white text-center">
                    Mijn inname
                  </p>

                  <div className="flex justify-center">
                    <img
                      src="https://frxvdjqqsgdynkktbvim.supabase.co/storage/v1/object/public/layout/bord_wit.png"
                      alt="Mijn inname"
                      className="w-32 h-32 object-contain"
                    />
                  </div>
                </Link>

                {/* TILE 2 */}
                <Link
                  href="/my-nutrition"
                  className="w-64 h-64 rounded-2xl p-4 bg-orange-500 hover:shadow-lg transition flex flex-col items-center justify-center"
                >
                  <p className="mb-3 font-semibold text-white text-center">
                    Mijn voedingswaarden
                  </p>

                  <div className="flex justify-center">
                    <img
                      src="https://frxvdjqqsgdynkktbvim.supabase.co/storage/v1/object/public/layout/board_wit.png"
                      alt="Mijn voedingswaarden dashboard"
                      className="w-32 h-32 object-contain"
                    />
                  </div>
                </Link>

              </div>
            </div>

            {/* MIJN ACTIVITEIT */}
            <div className="rounded-xl p-6 bg-white shadow-md flex flex-col items-center justify-center">
              <h2 className="mb-4 font-bold text-center text-2xl">
                Mijn activiteit
              </h2>

              <Link
                href="/my-activity"
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-400 transition"
              >
                Activiteit registreren
              </Link>
            </div>

            {/* MIJN GEWICHT (TILE) */}
            <div className="rounded-xl p-6 bg-white shadow-md flex flex-col items-center justify-center">
              <h2 className="mb-4 font-bold text-center text-2xl">
                Mijn gewicht
              </h2>

              <Link
                href="/my-weight"
                className="w-64 h-64 rounded-2xl p-4 bg-orange-500 hover:shadow-lg transition flex flex-col items-center justify-center"
              >
                <p className="mb-3 font-semibold text-white text-center">
                  Registratie & Dashboard
                </p>

                <div className="flex justify-center">
                  <img
                    src="https://frxvdjqqsgdynkktbvim.supabase.co/storage/v1/object/public/layout/scale_wit.png"
                    alt="Mijn gewicht"
                    className="w-32 h-32 object-contain"
                  />
                </div>
              </Link>
            </div>

            {/* MIJN OVERZICHT */}
            <div className="rounded-xl p-6 bg-white shadow-md flex flex-col items-center justify-center">
              <h2 className="mb-4 font-bold text-center text-2xl">
                Mijn overzicht
              </h2>

              <Link
                href="/my-overview"
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-400 transition"
              >
                Open
              </Link>
            </div>

          </>
        )}

      </div>
    </div>
  )
}