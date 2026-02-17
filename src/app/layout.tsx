import type { Metadata } from 'next';
import { Outfit, Kanit } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const outfit = Outfit({ 
  subsets: ['latin'], 
  variable: '--font-outfit',
  display: 'swap',
});

const kanit = Kanit({ 
  subsets: ['thai', 'latin'], 
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-kanit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'LifePulse — Track Your Expenses',
  description:
    'LifePulse is your daily life tracker. Start with expense tracking — import bank & credit card statements, track categories, and set budget goals. Built for teens who want to stay on top of their cash.',
  keywords: ['expense tracker', 'budget', 'finance', 'money management', 'LifePulse'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} ${kanit.variable} font-sans antialiased text-gray-900 bg-gray-50`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
