import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import AuthProviderWrapper from '@/components/AuthProviderWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'HoWToFL',
  description: 'HoWToFL !:)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs">
      <body className={inter.className}>
        <AuthProviderWrapper>
          <main className="w-full min-h-screen flex items-center justify-center">
            {children}
          </main>
        </AuthProviderWrapper>
      </body>
    </html>
  );
} 