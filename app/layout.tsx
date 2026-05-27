import "./globals.css"
import ClientLayout from "./ClientLayout"
import AuthGuard from './components/AuthGuard'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-slate-900">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}