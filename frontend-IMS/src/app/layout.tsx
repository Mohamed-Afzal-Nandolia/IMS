import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'IMS Pro — Inventory Management & Billing',
  description:
    'Production-grade GST-compliant Inventory Management and Billing System for Indian businesses. Manage products, sales, purchases, GST, accounting and more.',
  keywords: 'inventory management, billing, GST, Indian business, invoicing, accounting',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
