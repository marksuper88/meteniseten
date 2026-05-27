'use client'

import { useEffect, useState } from 'react';
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from '../hooks/useAuth'

type Profile = {
  email: string
  username: string | null
  profile_picture?: string | null
}

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const [profile, setProfile] = useState<Profile>({
    email: '',
    username: '',
    profile_picture: '',
  })

  const [initialProfile, setInitialProfile] = useState<Profile | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    if (loading) return
    if (!user) {
      setIsLoading(false)
      return
    }

    const fetchProfile = async () => {
      setIsLoading(true)

      const { data, error } = await supabase
        .from('profiles')
        .select('email, username, profile_picture')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        setError(error.message)
      } else if (data) {
   const loaded = {
  email: data.email ?? user.email ?? '',
  username: data.username ?? '',
  profile_picture: data.profile_picture ?? '',
}

        setProfile(loaded)
        setInitialProfile(loaded)
      } else {
        const empty = {
          email: user.email ?? '',
          username: '',
        }

        setProfile(empty)
        setInitialProfile(empty)
      }

      setIsLoading(false)
    }

    fetchProfile()
  }, [loading, user])

  const handleChange = (field: 'username', value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user || !initialProfile) return

    setSaving(true)
    setMessage(null)
    setError(null)

    // ✅ FIX: check of er echt iets veranderd is
const hasChanges =
  profile.username !== initialProfile.username ||
  file !== null

    if (!hasChanges) {
      setError('No changes detected.')
      setSaving(false)
      return
    }

    let uploadedUrl = profile.profile_picture
    if (file) {
  const fileName = `${user.id}-${Date.now()}`

  const { error: uploadError } = await supabase.storage
    .from('profile_picture')
    .upload(fileName, file)

  if (uploadError) {
    setError(uploadError.message)
    setSaving(false)
    return
  }

  const { data: publicUrlData } = supabase.storage
    .from('profile_picture')
    .getPublicUrl(fileName)

  uploadedUrl = publicUrlData.publicUrl
}

    const { data, error } = await supabase
      .from('profiles')
      .update({
        username: profile.username,
        profile_picture: uploadedUrl,
      })
      .eq('user_id', user.id)
      .select()

    if (error) {
      setError(error.message)
    } else if (!data || data.length === 0) {
      setError('No changes were saved.')
    } else {
  setMessage('Your profile was updated successfully.')

  setProfile(prev => ({
    ...prev,
    profile_picture: uploadedUrl,
  }))

  setInitialProfile({
    ...profile,
    profile_picture: uploadedUrl,
  })

  setFile(null)
}

    setSaving(false)
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-100 p-6">
        <div className="rounded-xl bg-white p-8 shadow">Loading profile…</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-100 p-6">
        <div className="rounded-xl bg-white p-8 shadow text-center">
          <h1 className="text-xl font-semibold mb-2">Not signed in</h1>
          <p className="text-gray-600">Sign in to view and edit your profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-100 py-10 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 rounded-3xl bg-white p-8 shadow-lg">

          <div className="mb-6">
            <h1 className="text-3xl font-semibold text-slate-900">
                Goed bezig {profile.username || '...'}!
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

    {/* KOLOM A */}
    <div className="space-y-6">

      {/* EMAIL */}
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Email address
        <input
          type="email"
          value={profile.email}
          disabled
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 opacity-70 cursor-not-allowed"
        />
      </label>

      {/* USERNAME */}
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Username
        <input
          type="text"
          value={profile.username ?? ''}
          onChange={e => handleChange('username', e.target.value)}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </label>


    </div>

        {/* KOLOM B */}
    <div className="space-y-6">

      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Profile picture
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
        />
      </label>

      {profile.profile_picture && (
        <div className="flex flex-col items-start gap-3">
          <img
            src={profile.profile_picture}
            alt="Profile"
            className="h-32 w-32 rounded-full object-cover border border-slate-200"
          />
        </div>
      )}

    </div>
      </div> {/* end grid */}

      {message && (
    <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">
      {message}
    </div>
  )}

  {error && (
    <div className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">
      {error}
    </div>
  )}

  <button
    type="submit"
    disabled={saving}
    className="inline-flex items-center justify-center rounded-2xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
  >
    {saving ? 'Saving…' : 'Save changes'}
  </button>

</form>
               </div>
      </div>
    </div>
  )
}