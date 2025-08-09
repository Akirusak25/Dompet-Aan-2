import SWRegister from './SWRegister';
export const metadata = { title: 'Dompet Aan', description: 'Catatan keuangan & trading' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#111111" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/favicon.svg" />
      </head>
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        <div className="max-w-3xl mx-auto p-4">{children}<SWRegister /></div>
      </body>
    </html>
  );
}
