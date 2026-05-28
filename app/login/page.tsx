'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

const handleLogin = async () => {
  setMessage('')

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    setMessage(error.message)
  } else {
    router.push('/')
  }
}

const handleSignup = () => {
  router.push('/signup')
}

const handleForgotPassword = async () => {
  setMessage('')

  if (!email) {
    setMessage('Vul eerst je email in')
    return
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })

  if (error) {
    setMessage(error.message)
  } else {
    setMessage('Reset link verstuurd naar je email')
  }
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100">

      {/* LOGIN CARD */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        {/* TITLE */}
        <h1 className="text-2xl font-bold text-center mb-6">
          Meten is Eten
        </h1>

        <p className="text-center text-slate-900 mb-6">
          Meer grip op je gewicht
        </p>

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* LOGIN BUTTON */}
        <button
          onClick={handleLogin}
          className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-400 transition"
        >
          Login
        </button>
        

 {/* SIGNUP BUTTON */}
<button
  onClick={handleSignup}
  className="w-full mt-3 bg-white border border-orange-500 text-orange-500 py-3 rounded-lg font-semibold hover:bg-orange-50 transition"
>
  Ik doe mee!
</button>

{/* FORGOT PASSWORD */}
<p className="text-center text-sm mt-4">
  <span
    onClick={handleForgotPassword}
    className="text-blue-500 cursor-pointer hover:underline"
  >
    Wachtwoord vergeten?
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