import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import { getSiteConfig } from '@/lib/config';

const config = getSiteConfig();

export const metadata: Metadata = {
  metadataBase: new URL(config.siteUrl),
  title: `${config.siteName} — каталог AI-сайтов и проектов`,
  description: config.siteDescription,
  openGraph: {
    title: config.siteName,
    description: config.siteDescription,
    url: config.siteUrl,
    siteName: config.siteName,
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: config.siteName,
    description: config.siteDescription
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="dark">
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="sticky top-0 z-40 border-b border-surface-border bg-surface/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
              <Link href="/" className="flex items-center gap-2 text-lg font-bold text-white">
                <span className="text-accent">✦</span> {config.siteName}
              </Link>
              <nav className="flex items-center gap-3">
                <a
                  href="/sitemap.xml"
                  className="hidden text-xs text-gray-500 hover:text-gray-300 sm:inline"
                >
                  sitemap.xml
                </a>
                <ThemeToggle />
              </nav>
            </div>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="border-t border-surface-border py-8">
            <div className="mx-auto max-w-6xl px-4 text-sm text-gray-500 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p>© {new Date().getFullYear()} {config.siteName}. Каталог пополняется автоматически.</p>
              <div className="flex gap-4">
                <a href="https://vk.com/azaza228228" target="_blank" rel="noreferrer noopener" className="hover:text-gray-300">VK</a>
                <a href="https://t.me/FillShow" target="_blank" rel="noreferrer noopener" className="hover:text-gray-300">Telegram</a>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
