import { IntroExperience } from "@/components/public/intro-experience";
import { SearchProvider } from "@/components/public/search-provider";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { ScrollToTopOnRouteChange } from "@/components/public/scroll-restoration";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SearchProvider>
      <ScrollToTopOnRouteChange />
      <IntroExperience />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-void focus:px-4 focus:py-2 focus:text-[10px] focus:font-medium focus:uppercase focus:tracking-[0.18em] focus:text-soft focus:outline focus:outline-1 focus:outline-blood"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="min-h-dvh">
        {children}
      </main>
      <SiteFooter />
    </SearchProvider>
  );
}
