import { useId } from "react";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";

interface FieldShellProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

const control =
  "block w-full min-h-12 rounded-lg border-2 border-slate bg-paper px-4 py-2.5 text-lg text-ink " +
  "placeholder:text-slate/70 aria-[invalid=true]:border-rhodo disabled:bg-mist";

/** Shared wrapper: visible label, hint and error, wired with aria-describedby. */
function FieldShell({
  id,
  label,
  hint,
  error,
  required,
  className,
  children,
}: FieldShellProps & { id: string; children: ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block font-semibold">
        {label}
        {required ? (
          <span className="font-normal text-slate"> (required)</span>
        ) : (
          <span className="font-normal text-slate"> (optional)</span>
        )}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="mb-2 text-base text-slate">
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 flex gap-1.5 text-base font-semibold text-rhodo">
          <span aria-hidden="true">×</span>
          {error}
        </p>
      )}
    </div>
  );
}

function describedBy(id: string, hint?: string, error?: string) {
  const ids = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean);
  return ids.length ? ids.join(" ") : undefined;
}

export function TextField({
  label,
  hint,
  error,
  required,
  className,
  ...rest
}: FieldShellProps & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <FieldShell {...{ id, label, hint, error, required, className }}>
      <input
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={control}
        {...rest}
      />
    </FieldShell>
  );
}

export function TextAreaField({
  label,
  hint,
  error,
  required,
  className,
  rows = 5,
  ...rest
}: FieldShellProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <FieldShell {...{ id, label, hint, error, required, className }}>
      <textarea
        id={id}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={control}
        {...rest}
      />
    </FieldShell>
  );
}

export function SelectField({
  label,
  hint,
  error,
  required,
  className,
  children,
  ...rest
}: FieldShellProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  return (
    <FieldShell {...{ id, label, hint, error, required, className }}>
      <select
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={control}
        {...rest}
      >
        {children}
      </select>
    </FieldShell>
  );
}

export function CheckboxField({
  label,
  hint,
  className,
  ...rest
}: { label: ReactNode; hint?: string; className?: string } & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
>) {
  const id = useId();
  return (
    <div className={cn("flex gap-3", className)}>
      <input
        id={id}
        type="checkbox"
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="mt-1 h-6 w-6 shrink-0 accent-ink"
        {...rest}
      />
      <div>
        <label htmlFor={id} className="font-semibold">
          {label}
        </label>
        {hint && (
          <p id={`${id}-hint`} className="text-base text-slate">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}

/** Radio group rendered as selectable rows. The legend names the group. */
export function RadioGroup({
  legend,
  name,
  options,
  defaultValue,
  hint,
}: {
  legend: string;
  name: string;
  options: Array<{ value: string; label: string; description?: string }>;
  defaultValue?: string;
  hint?: string;
}) {
  const groupId = useId();
  return (
    <fieldset aria-describedby={hint ? `${groupId}-hint` : undefined}>
      <legend className="mb-1.5 font-semibold">{legend}</legend>
      {hint && (
        <p id={`${groupId}-hint`} className="mb-2 text-base text-slate">
          {hint}
        </p>
      )}
      <div className="space-y-2">
        {options.map((o) => {
          const id = `${groupId}-${o.value}`;
          return (
            <div
              key={o.value}
              className="flex gap-3 rounded-lg border-2 border-mist bg-paper p-3 has-[:checked]:border-ink"
            >
              <input
                id={id}
                type="radio"
                name={name}
                value={o.value}
                defaultChecked={o.value === defaultValue}
                className="mt-1 h-5 w-5 shrink-0 accent-ink"
              />
              <label htmlFor={id} className="flex-1 font-semibold">
                {o.label}
                {o.description && (
                  <span className="block text-base font-normal text-slate">{o.description}</span>
                )}
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
