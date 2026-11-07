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
      <SiteHeader />
      <main id="main" className="min-h-dvh">
        {children}
      </main>
      <SiteFooter />
    </SearchProvider>
  );
}
