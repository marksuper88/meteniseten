'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ADMIN_EMAIL = 'marksuper88@gmail.com'

const MOBILE_LOGO_URL =
  'https://rqkpxvhmjibpeqkvmgmc.supabase.co/storage/v1/object/public/layout-images/Lets_Denz.jpeg'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)

      if (data.user) {
        fetchProfile(data.user.id)
      }
    }

    const fetchProfile = async (userId: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('profile_picture, username')
        .eq('user_id', userId)
        .single()

      if (error || !data) {
        setProfile(null)
        return
      }

      setProfile(data)
    }

    getUser()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const u = session?.user ?? null
        setUser(u)

        if (u) {
          fetchProfile(u.id)
        } else {
          setProfile(null)
        }
      }
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setOpen(false)
  }

  const pathname = usePathname()

  const profileImageUrl = profile?.profile_picture || null

  const avatarLetter =
    profile?.username?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase()

const [isSticky, setIsSticky] = useState(false)

useEffect(() => {
  const handleScroll = () => {
    setIsSticky(window.scrollY > 0)
  }

  window.addEventListener('scroll', handleScroll)

  return () => window.removeEventListener('scroll', handleScroll)
}, [])

  return (
    <div className="sticky top-0 z-50 w-full bg-white shadow-md">

  {/* ⚪ MENU BAR */}
  <div className="px-6 h-20 flex justify-between items-center justify-between relative border-t border-b border-orange-500 relative">


        {/* LEFT SIDE */}
        <div className="flex items-center gap-4">

          {/* MOBILE LOGO */}
          <Link href="/" className="block md:hidden">
            <img
              src={MOBILE_LOGO_URL}
              alt="Logo"
              className="h-14 w-auto object-contain"
            />
          </Link>

{/* CENTER TITLE */}
<Link
  href="/"
  className={`
    absolute left-1/2 top-1/2
    -translate-x-1/2 -translate-y-1/2
    transition-opacity duration-300

    md:${isSticky ? 'opacity-100' : 'opacity-0 pointer-events-none'}
  `}
>
  <img
    src="https://rqkpxvhmjibpeqkvmgmc.supabase.co/storage/v1/object/public/layout-images/Lets_Denz_text.png"
    alt="Let's Denz"
    className="h-full max-h-14 w-auto object-contain"
  />
</Link>

          {/* DESKTOP DASHBOARD */}
{pathname !== '/' && (
  <Link
  href="/"
  className="hidden md:inline-flex items-center gap-1 px-2 py-2 rounded-md bg-orange-500 text-white font-semibold hover:bg-orange-400 transition"
>
  <span className="text-lg leading-none">←</span>
  Dashboard
</Link>
)}

        </div>

        {/* RIGHT SIDE */}
        <div className="relative" ref={menuRef}>

          {user ? (
            <div>

              <button
                onClick={() => setOpen(!open)}
                className="w-12 h-12 rounded-full bg-white flex items-center justify-center font-bold hover:scale-105 transition overflow-hidden"
              >
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  avatarLetter
                )}
              </button>

              {open && (
                <div className="absolute right-0 mt-3 w-56 bg-white border shadow-xl rounded-xl p-3">

                  <p className="text-sm text-gray-600 mb-3 truncate">
                    {user.email}
                  </p>

                  <Link
                    href="/profile"
                    className="block text-sm text-gray-700 hover:bg-gray-100 p-2 rounded mb-1"
                    onClick={() => setOpen(false)}
                  >
                    Mijn profiel
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left text-red-500 text-sm hover:bg-gray-100 p-2 rounded"
                  >
                    Logout
                  </button>

                </div>
              )}

            </div>
          ) : (
<Link
  href="/login"
  className="inline-flex items-center justify-center px-2 py-2 rounded-md bg-orange-500 text-white font-semibold hover:bg-orange-400 transition"
>
  Login
</Link>
          )}

        </div>

      </div>
    </div>
  )
}