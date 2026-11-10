import type { Metadata } from 'next';
import '../index.css';
import { getAdSenseConfig } from '@/lib/adsenseService';

export const metadata: Metadata = {
  title: 'Stackx - The Ultimate Tools Suite for all your needs',
  description: 'Online tools for PDF, images, media, network, and more with 100% client-side privacy.',
  icons: {
    icon: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adConfig = getAdSenseConfig();
  const rawPubId = adConfig.publisherId || 'ca-pub-2275978117553909';
  const fullPubId = rawPubId.startsWith('ca-') ? rawPubId : `ca-${rawPubId}`;
  const shouldLoadAdSense = adConfig.enabled || Boolean(adConfig.publisherId);

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {shouldLoadAdSense && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${fullPubId}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="bg-slate-950 text-slate-100" suppressHydrationWarning>{children}</body>
    </html>
  );
}
