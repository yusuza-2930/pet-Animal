import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/manrope";
import "@fontsource-variable/inter";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { StoreProvider } from "@/components/providers/StoreProvider";
import { AnnouncementBar, SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/Toaster";
import { BackToTop, CustomCursor, LoadingScreen, ScrollProgress } from "@/components/motion/Motion";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: `${siteConfig.name} — ${siteConfig.tagline}`, template: `%s · ${siteConfig.name}` },
  description: siteConfig.description,
  openGraph: { type: "website", siteName: siteConfig.name, images: ["/images/hero.jpg"] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#344B5B", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN">
      <body>
        <noscript><style>{`.scp-loader{display:none!important}`}</style></noscript>
        <a href="#main" className="sr-only z-[110] rounded-full bg-slate px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3">Skip to content</a>
        <StoreProvider>
          <ScrollProgress />
          <LoadingScreen />
          <AnnouncementBar />
          <SiteHeader />
          <main id="main" className="min-h-[60vh]">{children}</main>
          <Footer />
          <Toaster />
          <BackToTop />
          <CustomCursor />
        </StoreProvider>
      </body>
    </html>
  );
}
