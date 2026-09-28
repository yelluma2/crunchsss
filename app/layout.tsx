import type { Metadata } from 'next';
import { ThemeProvider } from '@/context/ThemeContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { siteConfig } from '@/data/site';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} | Comfort food, made from scratch`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: { icon: '/images/logo.svg' },
};

// Runs before first paint so a saved dark theme never flashes light
const themeScript = `try{if(localStorage.getItem('theme')==='dark'){document.documentElement.classList.add('dark')}}catch(e){}`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-screen flex-col bg-brand-secondary text-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
        <ThemeProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
