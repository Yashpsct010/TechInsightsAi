import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';
import Header from '../components/Header';
import Footer from '../components/Footer';
import OfflineNotice from '../components/OfflineNotice';
import ErrorBoundary from '../components/ErrorBoundary';

export const viewport: Viewport = {
  themeColor: '#0a0a0c',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'TechInsights AI - Latest Tech News, AI/ML Insights & Coding Updates',
    template: '%s | TechInsights AI',
  },
  description:
    'Discover the latest in technology, artificial intelligence, machine learning, coding, cybersecurity, and emerging tech trends. Expert analysis and insights at TechInsights AI.',
  keywords: [
    'tech news',
    'artificial intelligence',
    'machine learning',
    'coding tutorials',
    'cybersecurity updates',
    'emerging technology',
    'AI blogs',
    'ML insights',
    'technology trends',
  ],
  authors: [{ name: 'TechInsights AI' }],
  creator: 'TechInsights AI',
  publisher: 'TechInsights AI',
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-196.png', sizes: '196x196', type: 'image/png' },
      { url: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png' }, { url: '/apple-icon-180.png', sizes: '180x180' }],
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    title: 'TechInsights AI - Latest Tech News, AI/ML Insights & Coding Updates',
    description:
      'Discover the latest in technology, artificial intelligence, machine learning, coding, cybersecurity, and emerging tech trends. Expert analysis and insights at TechInsights AI.',
    siteName: 'TechInsights AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TechInsights AI - Latest Tech News, AI/ML Insights & Coding Updates',
    description:
      'Discover the latest in technology, artificial intelligence, machine learning, coding, cybersecurity, and emerging tech trends. Expert analysis and insights at TechInsights AI.',
  },
  verification: {
    google: 'EP61Sh2IxjUEFgHT_jdFWEBtgukmT8UKDzwRvj9CB_k',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${baseUrl}/#organization`,
        name: 'TechInsights AI',
        url: baseUrl,
        logo: `${baseUrl}/pwa-192x192.png`,
        sameAs: ['https://github.com/yashpsct010', 'https://linkedin.com/in/y-sh'],
      },
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        url: baseUrl,
        name: 'TechInsights AI',
        publisher: {
          '@id': `${baseUrl}/#organization`,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${baseUrl}/blogs?search={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="flex flex-col min-h-screen bg-[#0a0a0c] text-slate-100 antialiased selection:bg-[#ec5b13] selection:text-white">
        <ErrorBoundary>
          <Providers>
            <OfflineNotice />
            <Header />
            <main className="flex-grow pt-16 sm:pt-20">{children}</main>
            <Footer />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
