import "./globals.css";
import ClientLayout from "./ClientLayout";

export const metadata = {
  manifest: "/manifest.json",

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KOERS",
  },

  title: "KOERS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        {/* PWA / iOS FIX */}
        <link rel="manifest" href="/manifest.json" />

        {/* iOS iconen (BELANGRIJK) */}
        <link rel="apple-touch-icon" href="/180x180.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/192x192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/512x512.png" />

        {/* iOS standalone mode */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="KOERS" />

        {/* extra fallback (soms nodig) */}
        <meta name="theme-color" content="#000000" />
      </head>

      <body className="min-h-screen bg-gray-50 text-slate-900">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}