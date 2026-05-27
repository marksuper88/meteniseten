'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">

      {/* GRID */}
      <div className="grid grid-rows-4 gap-6 w-full max-w-3xl">

        {/* ROW 1 */}
        <div className="border-2 border-blue-500 rounded-xl p-6 bg-white flex flex-col items-center justify-center">
          <p className="mb-4 font-semibold">Mijn inname</p>
          <Link
            href="/my-intake"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition"
          >
            Open
          </Link>
        </div>

        {/* ROW 2 */}
        <div className="border-2 border-blue-500 rounded-xl p-6 bg-white flex flex-col items-center justify-center">
          <p className="mb-4 font-semibold">Mijn activiteit</p>
          <Link
            href="/my-activity"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition"
          >
            Open
          </Link>
        </div>

        {/* ROW 3 */}
        <div className="border-2 border-blue-500 rounded-xl p-6 bg-white flex flex-col items-center justify-center">
          <p className="mb-4 font-semibold">Mijn gewicht</p>
          <Link
            href="/my-weight"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition"
          >
            Open
          </Link>
        </div>

        {/* ROW 4 */}
        <div className="border-2 border-blue-500 rounded-xl p-6 bg-white flex flex-col items-center justify-center">
          <p className="mb-4 font-semibold">Mijn overzicht</p>
          <Link
            href="/my-overview"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition"
          >
            Open
          </Link>
        </div>

      </div>
    </div>
  )
}