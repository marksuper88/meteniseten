'use client'

import Header from "./components/header"
import Navbar from "./components/Navbar"
import PageTitle from "./components/PageTitle"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">

      {/* HEADER */}
      <Header />

      {/* NAVBAR */}
      <Navbar />

      {/* PAGE TITLE */}
      <PageTitle />

      {/* PAGE CONTENT */}
      <main className="flex-1">
        {children}
      </main>

    </div>
  )
}