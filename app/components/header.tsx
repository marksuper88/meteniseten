'use client'

const HEADER_IMAGE_URL =
  'https://frxvdjqqsgdynkktbvim.supabase.co/storage/v1/object/public/layout/scale.png'

export default function Header() {
  return (
    <div className="hidden md:flex bg-[#4DA3FF] px-6 py-8 justify-center items-center">
      <img
        src={HEADER_IMAGE_URL}
        alt="Logo"
        className="w-1/8 max-w-[320px] h-auto object-contain"
      />
    </div>
  )
}