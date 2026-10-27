import type { Metadata } from 'next';
import '../index.css';

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
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-slate-950 text-slate-100" suppressHydrationWarning>{children}</body>
    </html>
  );
}
