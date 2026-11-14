/**
 * Persistent notice on every Stage 1 page. Stage 1 exit gate: no private data in prototypes and
 * nothing that could be mistaken for a real beneficiary, payment or legal claim.
 */
export function PrototypeBanner({ area = "site" }: { area?: "site" | "admin" }) {
  return (
    <aside aria-label="Prototype notice" className="bg-flame text-ink">
      <p className="mx-auto max-w-6xl px-4 py-2 text-center text-sm font-semibold sm:px-6">
        Design prototype.{" "}
        {area === "admin"
          ? "All records are fictional and no real actions are taken."
          : "Every name, case and figure here is fictional. Nothing is sent and no payment is taken."}
      </p>
    </aside>
  );
}
