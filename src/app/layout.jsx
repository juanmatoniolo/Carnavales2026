import 'bootstrap/dist/css/bootstrap.min.css';
import BootstrapClient from "@/components/BootstrapClient";
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import './globals.css';
import { Inter, Great_Vibes } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const greatVibes = Great_Vibes({ weight: '400', subsets: ['latin'], variable: '--font-greatvibes' });


const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Carnaval Chajarí',
  description: 'Sistema de gestión de comparsas y bailarines',
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon-32x32.webp', sizes: '32x32', type: 'image/webp', media: '(prefers-color-scheme: light)' },
      { url: '/favicon-32x32-dark.webp', sizes: '32x32', type: 'image/webp', media: '(prefers-color-scheme: dark)' },
      { url: '/favicon-16x16.webp', sizes: '16x16', type: 'image/webp', media: '(prefers-color-scheme: light)' },
      { url: '/favicon-16x16-dark.webp', sizes: '16x16', type: 'image/webp', media: '(prefers-color-scheme: dark)' },
    ],
    apple: [
      { url: '/apple-touch-icon.webp', type: 'image/webp', media: '(prefers-color-scheme: light)' },
      { url: '/apple-touch-icon-dark.webp', type: 'image/webp', media: '(prefers-color-scheme: dark)' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#000000' },
    ],
  },
  manifest: '/site.webmanifest',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  // Open Graph para previews (PC y teléfono)
  openGraph: {
    type: 'website',
    url: '/',
    title: 'Carnaval Chajarí',
    description: 'Sistema de gestión de comparsas y bailarines',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Carnaval Chajarí – Máscara y plumas',
        type: 'image/png',
      },
    ],
  },
  // Twitter Cards
  twitter: {
    card: 'summary_large_image',
    title: 'Carnaval Chajarí',
    description: 'Sistema de gestión de comparsas y bailarines',
    images: ['/og-image.webp'],
    creator: '@carnavalchajari', // opcional, si lo tenés
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head />
      <body className={`${inter.variable} ${greatVibes.variable}`}>
        <BootstrapClient />
        {children}
      </body>
    </html>
  );
}
