'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [username, setUsername] = useState('')
  

const handleSignup = async () => {
  setMessage('')

  if (!username.trim()) {
    setMessage('Username is verplicht')
    return
  }

  const cleanUsername = username.toLowerCase().trim().replace(/\s+/g, '')

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: cleanUsername,
      },
    },
  })

  if (error) {
    setMessage(error.message)
    return
  }

  setMessage('Account aangemaakt! Je kunt nu inloggen.')
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100">

      {/* LOGIN CARD */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        {/* TITLE */}
        <h1 className="text-2xl font-bold text-center mb-6">
          Doe mee!
        </h1>

        <p className="text-center text-slate-900 mb-6">
          Voor een optimale beleving van het WK
        </p>

{/* EMAIL */}
<input
  type="email"
  placeholder="Email"
  value={email}
  autoComplete="email"
  onChange={(e) => setEmail(e.target.value)}
  className="w-full mb-3 px-4 py-3 border rounded-lg"
/>

{/* USERNAME */}
<input
  type="text"
  placeholder="Username (verplicht)"
  value={username}
  autoComplete="username"
  name="username_signup"
  onChange={(e) => setUsername(e.target.value)}
  className="w-full mb-3 px-4 py-3 border rounded-lg"
/>

{/* PASSWORD */}
<input
  type="password"
  placeholder="Password"
  value={password}
  autoComplete="new-password"
  name="password_signup"
  onChange={(e) => setPassword(e.target.value)}
  className="w-full mb-4 px-4 py-3 border rounded-lg"
/>

        {/* SIGNUP BUTTON */}
        <button
          onClick={handleSignup}
className="w-full mt-3 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-400 transition"        >
          Maak je account aan
        </button>

<p className="text-center text-sm text-slate-900 mt-4">
  Heb je al een account?{" "}
  <span
    onClick={() => router.push('/login')}
    className="text-blue-600 cursor-pointer hover:underline"
  >
    Login
  </span>
</p>

        {/* MESSAGE */}
        {message && (
          <p className="text-center text-sm text-slate-900 mt-4">
            {message}
          </p>
        )}

      </div>
    </div>
  )
}