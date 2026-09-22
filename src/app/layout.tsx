import type { Metadata, Viewport } from 'next';
import './globals.css';
import IconSprite from '@/components/IconSprite';

export const metadata: Metadata = {
  title: 'Carverse Performance',
  description: 'Dealership gamification platform for Carverse Mobility.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#F7F8FA',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <IconSprite />
        {children}
      </body>
    </html>
  );
}
