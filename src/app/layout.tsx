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
  const shouldLoadAdSense = adConfig.enabled && adConfig.publisherId && !adConfig.testMode;

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {shouldLoadAdSense && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adConfig.publisherId}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="bg-slate-950 text-slate-100" suppressHydrationWarning>{children}</body>
    </html>
  );
}
