"use client";

import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
  useState,
} from "react";
import { Button } from "@/components/ui/Button";
import { ErrorAlert } from "@/components/ui/States";
import type { SourcingFormData } from "@/lib/types";

const steps = [
  { name: "Product Basics", description: "What you want to source" },
  { name: "Specifications", description: "Product and packaging details" },
  { name: "Commercial Requirements", description: "Quantity, price, and delivery" },
  { name: "Review", description: "Confirm before submission" },
];

const initialData: SourcingFormData = {
  productName: "",
  productCategory: "",
  referenceUrl: "",
  productDescription: "",
  referenceFileName: "",
  material: "",
  dimensions: "",
  color: "",
  customLogo: "No",
  customPackaging: "No",
  additionalRequirements: "",
  targetQuantity: "",
  targetUnitPrice: "",
  destinationCountry: "",
  amazonMarketplace: "",
  desiredDeliveryDate: "",
  sampleRequired: "Yes",
  preferredFulfillment: "Amazon FBA",
};

type FieldErrors = Partial<Record<keyof SourcingFormData, string>>;

function isValidReference(value: string) {
  if (/^[A-Z0-9]{10}$/i.test(value)) return true;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function Field({
  id,
  label,
  required = false,
  help,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  help?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
        {required ? <span className="ml-1 text-red-600" aria-hidden="true">*</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="field-error" role="alert">{error}</p>
      ) : help ? (
        <p id={`${id}-help`} className="field-help">{help}</p>
      ) : null}
    </div>
  );
}

function ReviewGroup({
  title,
  step,
  onEdit,
  rows,
}: {
  title: string;
  step: number;
  onEdit: (step: number) => void;
  rows: Array<{ label: string; value: string }>;
}) {
  return (
    <section className="rounded-xl border border-slate-200" aria-label={`${title} review`}>
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5 sm:px-5">
        <h3 className="font-semibold text-slate-950">{title}</h3>
        <button
          type="button"
          onClick={() => onEdit(step)}
          className="rounded-md px-2 py-1 text-sm font-semibold text-blue-700 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Edit
        </button>
      </div>
      <dl className="grid gap-x-8 gap-y-4 px-4 py-5 sm:grid-cols-2 sm:px-5">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{row.label}</dt>
            <dd className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-slate-800">
              {row.value || "Not provided"}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function SourcingRequestForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<SourcingFormData>(initialData);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const [submittedNumber, setSubmittedNumber] = useState<string>();

  const updateField = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const key = event.target.name as keyof SourcingFormData;
    setData((current) => ({ ...current, [key]: event.target.value }));
    if (errors[key]) {
      setErrors((current) => ({ ...current, [key]: undefined }));
    }
  };

  const updateDeliveryDate = (event: FormEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    setData((current) => ({ ...current, desiredDeliveryDate: value }));
    if (errors.desiredDeliveryDate) {
      setErrors((current) => ({ ...current, desiredDeliveryDate: undefined }));
    }
  };

  const fieldProps = (key: keyof SourcingFormData, hasHelp = false) => ({
    id: key,
    name: key,
    value: data[key],
    onChange: updateField,
    "aria-invalid": Boolean(errors[key]),
    "aria-describedby": errors[key]
      ? `${key}-error`
      : hasHelp
        ? `${key}-help`
        : undefined,
  });

  const validateStep = (step: number) => {
    const nextErrors: FieldErrors = {};

    if (step === 0) {
      if (!data.productName.trim()) nextErrors.productName = "Enter a product name.";
      if (!data.productCategory) nextErrors.productCategory = "Select a product category.";
      if (data.referenceUrl.trim() && !isValidReference(data.referenceUrl.trim())) {
        nextErrors.referenceUrl = "Enter a 10-character ASIN or a complete http(s) URL.";
      }
      if (data.productDescription.trim().length < 20) {
        nextErrors.productDescription = "Add at least 20 characters so the sourcing team has enough context.";
      }
    }

    if (step === 1) {
      if (!data.material.trim()) nextErrors.material = "Enter the preferred material.";
      if (!data.dimensions.trim()) nextErrors.dimensions = "Enter target dimensions or a size range.";
      if (!data.color.trim()) nextErrors.color = "Enter at least one target color.";
    }

    if (step === 2) {
      const quantity = Number(data.targetQuantity);
      const unitPrice = Number(data.targetUnitPrice);
      if (!Number.isInteger(quantity) || quantity < 1) {
        nextErrors.targetQuantity = "Enter a whole-number quantity greater than zero.";
      }
      if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
        nextErrors.targetUnitPrice = "Enter a target unit price greater than zero.";
      }
      if (!data.destinationCountry) nextErrors.destinationCountry = "Select a destination country.";
      if (!data.amazonMarketplace) nextErrors.amazonMarketplace = "Select a target Amazon marketplace.";
      if (!data.desiredDeliveryDate) {
        nextErrors.desiredDeliveryDate = "Choose a desired delivery date.";
      } else {
        const selectedDate = new Date(`${data.desiredDeliveryDate}T23:59:59`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (Number.isNaN(selectedDate.getTime()) || selectedDate < today) {
          nextErrors.desiredDeliveryDate = "Choose today or a future delivery date.";
        }
      }
    }

    setErrors(nextErrors);
    const firstError = Object.keys(nextErrors)[0] as keyof SourcingFormData | undefined;
    if (firstError) {
      window.requestAnimationFrame(() => {
        const field = document.getElementById(firstError);
        field?.focus({ preventScroll: true });
        field?.scrollIntoView({ block: "center" });
      });
    }
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(undefined);

    if (currentStep < steps.length - 1) {
      if (validateStep(currentStep)) {
        setCurrentStep((step) => step + 1);
        window.scrollTo({ top: 0 });
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/rfqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = (await response.json()) as { id?: string; rfqNumber?: string; error?: string };
      if (!response.ok || !result.id) throw new Error(result.error || "The request could not be saved.");

      setSubmittedNumber(result.rfqNumber);
      setIsSubmitted(true);
      window.setTimeout(() => router.push(`/rfqs/${result.id}?submitted=true`), 600);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "The request could not be saved.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep((step) => Math.max(0, step - 1));
    window.scrollTo({ top: 0 });
  };

  const handleEditStep = (step: number) => {
    setErrors({});
    setCurrentStep(step);
    window.scrollTo({ top: 0 });
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setData((current) => ({
      ...current,
      referenceFileName: file?.name ?? "",
    }));
  };

  if (isSubmitted) {
    return (
      <div className="panel px-5 py-14 text-center sm:px-10" role="status" aria-live="polite">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-2xl font-black text-emerald-700">
          ✓
        </div>
        <h2 className="mt-5 text-2xl font-bold text-slate-950">Request submitted</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
          {submittedNumber ? `${submittedNumber} was saved to your private workspace.` : "Your request was saved."} We are opening it now.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:items-start">
      <aside className="panel p-4 lg:sticky lg:top-24" aria-label="Request progress">
        <ol className="grid grid-cols-4 gap-2 lg:grid-cols-1 lg:gap-1">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isComplete = index < currentStep;
            return (
              <li key={step.name}>
                <button
                  type="button"
                  onClick={() => isComplete && handleEditStep(index)}
                  disabled={!isComplete}
                  aria-current={isActive ? "step" : undefined}
                  className={`flex w-full items-center gap-3 rounded-lg p-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 lg:p-3 ${
                    isActive ? "bg-blue-50" : isComplete ? "hover:bg-slate-50" : ""
                  }`}
                >
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : isComplete
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {isComplete ? "✓" : index + 1}
                  </span>
                  <span className="hidden lg:block">
                    <span className={`block text-sm font-semibold ${isActive ? "text-blue-800" : "text-slate-800"}`}>
                      {step.name}
                    </span>
                    <span className="mt-0.5 block text-xs leading-5 text-slate-500">{step.description}</span>
                  </span>
                  <span className="sr-only lg:hidden">{step.name}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </aside>

      <form onSubmit={handleSubmit} noValidate className="panel overflow-hidden">
        {submitError ? <div className="px-5 pt-5 sm:px-7"><ErrorAlert message={submitError} /></div> : null}
        <div className="border-b border-slate-200 px-5 py-5 sm:px-7 sm:py-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
            Step {currentStep + 1} of {steps.length}
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{steps[currentStep].name}</h2>
          <p className="mt-1.5 text-sm text-slate-600">{steps[currentStep].description}</p>
        </div>

        <div className="px-5 py-6 sm:px-7 sm:py-7">
          {currentStep === 0 ? (
            <div className="grid gap-6 sm:grid-cols-2">
              <Field id="productName" label="Product name" required error={errors.productName}>
                <input {...fieldProps("productName")} required className="text-field" placeholder="e.g. Foldable fabric storage organizer set" />
              </Field>
              <Field id="productCategory" label="Product category" required error={errors.productCategory}>
                <select {...fieldProps("productCategory")} required className="text-field">
                  <option value="" disabled>Select a category</option>
                  <option>Home & Storage</option>
                  <option>Pet Supplies</option>
                  <option>Sports & Outdoors</option>
                  <option>Beauty & Personal Care</option>
                  <option>Office Products</option>
                  <option>Other</option>
                </select>
              </Field>
              <div className="sm:col-span-2">
                <Field id="referenceUrl" label="Amazon ASIN or reference URL" help="Optional. Used as a visual reference only in this demo." error={errors.referenceUrl}>
                  <input {...fieldProps("referenceUrl", true)} className="text-field" placeholder="ASIN or https://example.com/product" />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field id="productDescription" label="Product description" required error={errors.productDescription}>
                  <textarea {...fieldProps("productDescription")} required rows={5} className="text-field resize-y" placeholder="Describe the product, intended customer, must-have features, and acceptable alternatives." />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field id="referenceImage" label="Reference image" help="Demo only. The file stays in your browser and is not uploaded.">
                  <label className="mt-2 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center transition hover:border-blue-400 hover:bg-blue-50/50 focus-within:outline focus-within:outline-2 focus-within:outline-blue-600">
                    <input id="referenceImage" type="file" accept="image/*" onChange={handleFileChange} aria-describedby="referenceImage-help" className="sr-only" />
                    <span className="text-sm font-semibold text-slate-800">
                      {data.referenceFileName || "Choose a reference image"}
                    </span>
                    <span className="mt-1 text-xs text-slate-500">PNG, JPG, or WEBP for interface demonstration</span>
                  </label>
                </Field>
              </div>
            </div>
          ) : null}

          {currentStep === 1 ? (
            <div className="grid gap-6 sm:grid-cols-2">
              <Field id="material" label="Material" required error={errors.material}>
                <input {...fieldProps("material")} required className="text-field" placeholder="e.g. 600D polyester with PE support board" />
              </Field>
              <Field id="dimensions" label="Dimensions" required error={errors.dimensions}>
                <input {...fieldProps("dimensions")} required className="text-field" placeholder="e.g. 40 × 30 × 25 cm" />
              </Field>
              <Field id="color" label="Color" required error={errors.color}>
                <input {...fieldProps("color")} required className="text-field" placeholder="e.g. Charcoal, warm gray, and navy" />
              </Field>
              <Field id="customLogo" label="Custom logo">
                <select {...fieldProps("customLogo")} className="text-field">
                  <option>Yes</option><option>No</option><option>Not sure</option>
                </select>
              </Field>
              <Field id="customPackaging" label="Custom packaging">
                <select {...fieldProps("customPackaging")} className="text-field">
                  <option>Yes</option><option>No</option><option>Not sure</option>
                </select>
              </Field>
              <div className="sm:col-span-2">
                <Field id="additionalRequirements" label="Additional requirements" help="Optional. Include certifications, compliance, labeling, or testing needs.">
                  <textarea {...fieldProps("additionalRequirements", true)} rows={5} className="text-field resize-y" placeholder="e.g. Reinforced handles, carton marks, textile labels..." />
                </Field>
              </div>
            </div>
          ) : null}

          {currentStep === 2 ? (
            <div className="grid gap-6 sm:grid-cols-2">
              <Field id="targetQuantity" label="Target quantity" required error={errors.targetQuantity}>
                <input {...fieldProps("targetQuantity")} required type="number" min="1" step="1" inputMode="numeric" className="text-field" placeholder="2500" />
              </Field>
              <Field id="targetUnitPrice" label="Target unit price (USD)" required error={errors.targetUnitPrice}>
                <input {...fieldProps("targetUnitPrice")} required type="number" min="0.01" step="0.01" inputMode="decimal" className="text-field" placeholder="7.50" />
              </Field>
              <Field id="destinationCountry" label="Destination country" required error={errors.destinationCountry}>
                <select {...fieldProps("destinationCountry")} required className="text-field">
                  <option value="">Select a country</option>
                  <option>United States</option><option>United Kingdom</option><option>Canada</option><option>Germany</option><option>Australia</option><option>Other</option>
                </select>
              </Field>
              <Field id="amazonMarketplace" label="Target Amazon marketplace" required error={errors.amazonMarketplace}>
                <select {...fieldProps("amazonMarketplace")} required className="text-field">
                  <option value="">Select a marketplace</option>
                  <option>Amazon.com</option><option>Amazon.co.uk</option><option>Amazon.ca</option><option>Amazon.de</option><option>Amazon.com.au</option><option>Other</option>
                </select>
              </Field>
              <Field id="desiredDeliveryDate" label="Desired delivery date" required error={errors.desiredDeliveryDate}>
                <input {...fieldProps("desiredDeliveryDate")} onInput={updateDeliveryDate} required type="date" className="text-field" />
              </Field>
              <Field id="sampleRequired" label="Sample required">
                <select {...fieldProps("sampleRequired")} className="text-field"><option>Yes</option><option>No</option><option>Not sure</option></select>
              </Field>
              <div className="sm:col-span-2">
                <Field id="preferredFulfillment" label="Preferred fulfillment">
                  <select {...fieldProps("preferredFulfillment")} className="text-field"><option>Amazon FBA</option><option>Overseas Warehouse</option><option>Other</option></select>
                </Field>
              </div>
            </div>
          ) : null}

          {currentStep === 3 ? (
            <div className="space-y-5">
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">
                Review your request before submitting. It will be saved to your private SourceBridge workspace.
              </div>
              <ReviewGroup
                title="Product Basics"
                step={0}
                onEdit={handleEditStep}
                rows={[
                  { label: "Product name", value: data.productName },
                  { label: "Category", value: data.productCategory },
                  { label: "ASIN or reference", value: data.referenceUrl },
                  { label: "Reference image", value: data.referenceFileName },
                  { label: "Description", value: data.productDescription },
                ]}
              />
              <ReviewGroup
                title="Specifications"
                step={1}
                onEdit={handleEditStep}
                rows={[
                  { label: "Material", value: data.material },
                  { label: "Dimensions", value: data.dimensions },
                  { label: "Color", value: data.color },
                  { label: "Custom logo", value: data.customLogo },
                  { label: "Custom packaging", value: data.customPackaging },
                  { label: "Additional requirements", value: data.additionalRequirements },
                ]}
              />
              <ReviewGroup
                title="Commercial Requirements"
                step={2}
                onEdit={handleEditStep}
                rows={[
                  { label: "Target quantity", value: data.targetQuantity },
                  { label: "Target unit price", value: data.targetUnitPrice ? `$${data.targetUnitPrice}` : "" },
                  { label: "Destination", value: data.destinationCountry },
                  { label: "Marketplace", value: data.amazonMarketplace },
                  { label: "Desired delivery", value: data.desiredDeliveryDate },
                  { label: "Sample required", value: data.sampleRequired },
                  { label: "Fulfillment", value: data.preferredFulfillment },
                ]}
              />
            </div>
          ) : null}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <Button variant="ghost" onClick={handleBack} disabled={currentStep === 0 || isSubmitting} className="sm:min-w-24">
            Back
          </Button>
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <p className="text-center text-xs text-slate-500 sm:text-right">
              {currentStep === 3 ? "Secure account submission" : "Required fields are marked *"}
            </p>
            <Button type="submit" disabled={isSubmitting} className="sm:min-w-36">
              {isSubmitting ? "Submitting…" : currentStep === 3 ? "Submit Request" : "Continue"}
              {!isSubmitting && currentStep < 3 ? <span aria-hidden="true">→</span> : null}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
