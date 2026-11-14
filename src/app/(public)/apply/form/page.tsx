import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { CheckboxField, SelectField, TextAreaField, TextField } from "@/components/ui/field";
import { Stepper, type Step } from "@/components/ui/stepper";

export const metadata: Metadata = { title: "Application form" };

const stepNames = ["About you", "Your household", "The need", "Documents", "Consent", "Review"];

type Params = Promise<{ step?: string }>;

function StepFields({ step }: { step: number }) {
  switch (step) {
    case 1:
      return (
        <div className="space-y-5">
          <TextField label="Your full name" name="guardian" autoComplete="name" required />
          <SelectField
            label="Your relationship to the child"
            name="relationship"
            required
            defaultValue=""
          >
            <option value="" disabled>
              Choose one
            </option>
            <option>Parent</option>
            <option>Legal guardian</option>
            <option>Authorized representative</option>
          </SelectField>
          <TextField
            label="Phone or messaging number"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            hint="Leave blank if you do not use email."
          />
          <SelectField label="Preferred language" name="language" defaultValue="en">
            <option value="en">English</option>
            <option value="ne">Nepali</option>
          </SelectField>
        </div>
      );
    case 2:
      return (
        <div className="space-y-5">
          <TextField
            label="Number of children in the household"
            name="children"
            inputMode="numeric"
            required
          />
          <SelectField label="Province" name="province" required defaultValue="">
            <option value="" disabled>
              Choose one
            </option>
            <option>Koshi</option>
            <option>Madhesh</option>
            <option>Bagmati</option>
            <option>Gandaki</option>
            <option>Lumbini</option>
            <option>Karnali</option>
            <option>Sudurpashchim</option>
          </SelectField>
          <TextAreaField
            label="Household situation"
            name="situation"
            hint="A few sentences. Do not include identity numbers."
            required
          />
        </div>
      );
    case 3:
      return (
        <div className="space-y-5">
          <SelectField label="Type of support" name="program" required defaultValue="">
            <option value="" disabled>
              Choose one
            </option>
            <option>Education support</option>
            <option>Essential living support</option>
          </SelectField>
          <TextAreaField
            label="What help is needed?"
            name="need"
            required
            hint="Say what you need and why it matters for the child."
          />
          <TextField
            label="Estimated cost in NPR"
            name="cost"
            inputMode="numeric"
            hint="Your best estimate. We check it during review."
          />
        </div>
      );
    case 4:
      return (
        <div className="space-y-5">
          <TextField
            label="Supporting document"
            name="doc"
            type="file"
            hint="Accepted file types and size limits are set in a later stage. Files are stored privately."
          />
          <Alert title="Private by default">
            Documents you upload are never shown on the public site.
          </Alert>
        </div>
      );
    case 5:
      return (
        <fieldset className="space-y-5">
          <legend className="mb-1 text-base text-slate">
            Each choice is separate. You can say yes to one and no to another.
          </legend>
          <CheckboxField
            name="consent-process"
            label="DIYALO may use my information to assess this application"
          />
          <CheckboxField
            name="consent-story"
            label="DIYALO may publish a short, anonymized description of the need"
          />
          <CheckboxField
            name="consent-image"
            label="DIYALO may publish a photo of the child"
            hint="Optional. You can withdraw this later."
          />
        </fieldset>
      );
    default:
      return (
        <div className="space-y-5">
          <Alert tone="warning" title="Submitting is turned off">
            In the prototype nothing is saved or sent. In the real form, you review your answers
            here and then submit.
          </Alert>
          <Button type="submit" size="lg" disabled>
            Submit application
          </Button>
        </div>
      );
  }
}

export default async function ApplyFormPage({ searchParams }: { searchParams: Params }) {
  const { step: raw } = await searchParams;
  const parsed = Number.parseInt(raw ?? "1", 10);
  const step = Number.isNaN(parsed) ? 1 : Math.min(Math.max(parsed, 1), stepNames.length);
  const steps: Step[] = stepNames.map((label, i) => ({
    label,
    state: i + 1 < step ? "complete" : i + 1 === step ? "current" : "upcoming",
  }));

  return (
    <>
      <PageHeader
        title="Application form"
        lead={`Step ${step} of ${stepNames.length}: ${stepNames[step - 1]}`}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Apply for Support", href: "/apply" },
          { label: "Application form" },
        ]}
      />
      <Container className="grid gap-10 py-12 lg:grid-cols-[16rem_1fr]">
        <Stepper label="Application steps" steps={steps} />
        <form className="max-w-2xl" aria-labelledby="step-title">
          <h2 id="step-title" className="mb-6 text-2xl">
            {stepNames[step - 1]}
          </h2>
          <StepFields step={step} />
          <div className="mt-10 flex flex-wrap items-center gap-3">
            {step > 1 && (
              <ButtonLink href={`/apply/form?step=${step - 1}`} variant="outline">
                Back
              </ButtonLink>
            )}
            {step < stepNames.length && (
              <ButtonLink href={`/apply/form?step=${step + 1}`}>Continue</ButtonLink>
            )}
            <Button type="button" variant="ghost" disabled>
              Save and finish later
            </Button>
          </div>
          <p className="mt-4 text-sm text-slate">Prototype: answers are not kept between steps.</p>
        </form>
      </Container>
    </>
  );
}
