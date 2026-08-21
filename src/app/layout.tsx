import React from 'react';
import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NutriGrade AI - Nutritional Quality & Additive Analysis Engine',
  description:
    'Algorithmic food nutrition grader, Nutri-Score calculator, NOVA ultra-processing detector, and personalized health warning system.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'NutriGrade AI',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#10b981',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="relative overflow-x-hidden">
        {/* Ambient Glowing Background Orbs */}
        <div className="fixed -top-40 -left-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none z-0" />
        <div className="fixed top-1/3 -right-40 w-96 h-96 bg-teal-500/15 rounded-full blur-[120px] pointer-events-none z-0" />
        <div className="fixed -bottom-40 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none z-0" />

        {/* Content Container */}
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
