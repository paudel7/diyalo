import { Container } from "@/components/layout/container";
import { PrototypeBanner } from "@/components/layout/prototype-banner";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ButtonLink } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/states";

export default function NotFound() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <PrototypeBanner />
      <SiteHeader />
      <main id="main" tabIndex={-1} className="outline-none">
        <Container className="py-16">
          <h1 className="sr-only">Page not found</h1>
          <ErrorState
            headingLevel={2}
            title="We can't find that page"
            action={<ButtonLink href="/">Go to the homepage</ButtonLink>}
          >
            The address may be mistyped or the page may have moved. Check the link, or start from
            the homepage.
          </ErrorState>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
