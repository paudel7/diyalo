"use client";

import { useId, useRef, type ReactNode } from "react";
import { Button, type ButtonVariant } from "@/components/ui/button";

/**
 * Modal dialog built on the native <dialog> element, which traps focus, closes on Escape and
 * returns focus to the trigger. In Stage 1 the confirm button only closes the dialog; real
 * actions are connected in later stages.
 */
export function ConfirmDialog({
  triggerLabel,
  triggerVariant = "outline",
  title,
  children,
  confirmLabel,
  confirmVariant = "primary",
  cancelLabel = "Cancel",
}: {
  triggerLabel: string;
  triggerVariant?: ButtonVariant;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  confirmVariant?: ButtonVariant;
  cancelLabel?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const close = () => ref.current?.close();

  return (
    <>
      <Button variant={triggerVariant} onClick={() => ref.current?.showModal()}>
        {triggerLabel}
      </Button>
      <dialog
        ref={ref}
        aria-labelledby={titleId}
        className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-xl bg-paper p-0 text-ink shadow-2xl backdrop:bg-ink-deep/70"
      >
        <div className="p-6">
          <h2 id={titleId} className="text-2xl">
            {title}
          </h2>
          <div className="mt-3 text-base text-slate">{children}</div>
        </div>
        <div className="flex flex-wrap justify-end gap-3 border-t border-mist bg-snow p-4">
          <Button variant="ghost" onClick={close}>
            {cancelLabel}
          </Button>
          <Button variant={confirmVariant} onClick={close}>
            {confirmLabel}
          </Button>
        </div>
      </dialog>
    </>
  );
}
