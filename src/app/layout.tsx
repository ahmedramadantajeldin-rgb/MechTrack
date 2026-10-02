import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'Mechanical Engineering Portal — MUST',
    template: '%s | ME Portal — MUST',
  },
  description:
    'Academic portal for the Mechanical Engineering Department at Misr University for Science and Technology (MUST). Access subjects, tasks, materials, and announcements.',
  keywords: [
    'MUST',
    'Misr University',
    'Mechanical Engineering',
    'Academic Portal',
    'Student Portal',
  ],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ME Portal',
  },
  openGraph: {
    type: 'website',
    title: 'Mechanical Engineering Portal — MUST',
    description:
      'Academic portal for the Mechanical Engineering Department at MUST',
    siteName: 'ME Portal — MUST',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#003087' },
    { media: '(prefers-color-scheme: dark)', color: '#001d52' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors closeButton position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
