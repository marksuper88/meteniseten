'use client'

import { usePathname } from 'next/navigation'

const titles: Record<string, string> = {
  '/': "Home",
  '/profile': 'Mijn profiel',
  '/login': 'Login',
  '/sign-up' : 'Account aanmaken',
  '/my-weight' : 'Mijn gewicht',
  '/my-intake' : 'Mijn voeding',
  '/my-activity' : 'Mijn activiteit',
  '/my-nutrition' : 'Mijn voedingswaarden dashboard'
}

export default function PageTitle() {
  const pathname = usePathname()

  const title = titles[pathname] ?? 'Page'

  return (
  <div className="bg-blue-500 text-white px-6 py-2 shadow flex justify-center md:justify-start">
    <h1 className="text-2xl font-bold text-center md:text-left">
      {title}
    </h1>
  </div>
)
}