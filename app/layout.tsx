import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ledgerline — Bookkeeping Retainer',
  description: 'A monthly bookkeeping retainer for small businesses.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
