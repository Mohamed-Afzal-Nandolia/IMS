import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

// Use next/font instead of CSS @import — eliminates render-blocking Google Fonts request,
// self-hosts the font, and applies font-display:swap automatically
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'IMS Pro — Inventory Management & Billing',
  description:
    'Production-grade GST-compliant Inventory Management and Billing System for Indian businesses. Manage products, sales, purchases, GST, accounting and more.',
  keywords: 'inventory management, billing, GST, Indian business, invoicing, accounting',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
