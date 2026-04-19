import type { Metadata } from 'next';
import './globals.css';
import ClientProviders from '@/components/layout/ClientProviders';

export const metadata: Metadata = {
  title: {
    default:  'Smart Service Marketplace — Find Expert Services Near You',
    template: '%s | Smart Service Marketplace',
  },
  description:
    'Discover and book trusted local service providers — plumbers, electricians, cleaners, tutors, and more. AI-powered matching, real-time booking, verified professionals.',
  keywords: ['home services', 'service marketplace', 'plumber', 'electrician', 'cleaning', 'tutor', 'India'],
  authors:  [{ name: 'Smart Service Marketplace' }],
  creator:  'Smart Service Marketplace',
  openGraph: {
    type:        'website',
    locale:      'en_IN',
    siteName:    'Smart Service Marketplace',
    title:       'Smart Service Marketplace — Find Expert Services Near You',
    description: 'Book verified local professionals instantly. AI-powered recommendations.',
  },
  robots: { index: true, follow: true },
  icons:  { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg-primary text-text-primary font-dm antialiased">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
