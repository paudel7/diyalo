import type { ReactNode } from "react";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/alert";

/**
 * Template for policy and governance pages. It never contains policy or legal text: it states
 * that the page is waiting for an approved policy and lists what that policy must cover, so
 * nobody reads placeholder wording as a commitment.
 */
export function PolicyPage({
  title,
  lead,
  decisionRef,
  mustCover,
  owner,
  children,
}: {
  title: string;
  lead: string;
  decisionRef: string;
  mustCover: string[];
  owner: string;
  children?: ReactNode;
}) {
  return (
    <>
      <PageHeader
        title={title}
        lead={lead}
        crumbs={[{ label: "Home", href: "/" }, { label: title }]}
      />
      <Container className="py-12">
        <div className="prose-diyalo">
          <Alert tone="warning" title="Policy text not yet approved">
            This page is a placeholder. The approved text will be published here once {owner} has
            signed it off ({decisionRef}). Until then, nothing on this page is a commitment.
          </Alert>
          <h2>What this page will cover</h2>
          <ul>
            {mustCover.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {children}
        </div>
      </Container>
    </>
  );
}
