import { HeroPreview } from "@/components/home/HeroPreview";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";

const workflow = [
  {
    step: "01",
    title: "Submit Requirements",
    description: "Share product specifications, target price, quantity, and delivery goals.",
  },
  {
    step: "02",
    title: "Compare Verified Quotes",
    description: "Review normalized offers from export-ready suppliers side by side.",
  },
  {
    step: "03",
    title: "Approve Sample",
    description: "Confirm materials, branding, packaging, and quality before production.",
  },
  {
    step: "04",
    title: "Track Production & Shipping",
    description: "Follow each milestone from factory floor to your fulfillment destination.",
  },
];

const capabilities = [
  {
    number: "01",
    title: "Supplier Sourcing",
    description:
      "Turn one clear brief into comparable quotes from suppliers matched to your product and market needs.",
  },
  {
    number: "02",
    title: "Landed Cost Analysis",
    description:
      "See product, packaging, freight, duty, marketplace fees, and allowances in one working estimate.",
  },
  {
    number: "03",
    title: "Sample & Quality Control",
    description:
      "Keep sample feedback, approvals, and pre-shipment inspection checkpoints connected to the RFQ.",
  },
  {
    number: "04",
    title: "Fulfillment Tracking",
    description:
      "Track production and international shipping milestones without chasing disconnected messages.",
  },
];

const buyerValues = [
  "One structured workflow from product brief to delivery",
  "Supplier identities protected until the process is ready",
  "Comparable commercial terms instead of mismatched quote sheets",
  "Clear assumptions behind landed cost and margin estimates",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden border-b border-slate-200 bg-slate-50">
          <div className="absolute inset-x-0 top-0 h-1 bg-blue-600" />
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.04fr_.96fr] lg:px-8 lg:py-28">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-blue-700">
                China sourcing, made operational
              </div>
              <h1 className="mt-7 max-w-3xl text-5xl font-bold leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-7xl">
                Source Smarter <span className="text-blue-600">from China</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                SourceBridge helps Amazon sellers find suppliers, compare quotes,
                estimate landed costs, manage quality, and track fulfillment in
                one transparent workflow.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/rfqs/new" className="px-5" testId="hero-new-rfq">
                  Submit a Sourcing Request <span aria-hidden="true">→</span>
                </ButtonLink>
                <ButtonLink href="/dashboard" variant="secondary" className="px-5">
                  View Demo Dashboard
                </ButtonLink>
              </div>
              <p className="mt-4 text-xs leading-5 text-slate-500">
                Frontend demo only — no account or payment required.
              </p>
            </div>
            <HeroPreview />
          </div>
        </section>

        <section id="workflow" className="scroll-mt-20 bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="A clearer path to purchase"
              title="Four steps from brief to delivery"
              description="Each decision stays connected to the same sourcing request, giving buyers a clean view of progress and next actions."
              centered
            />
            <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 md:grid-cols-2 lg:grid-cols-4">
              {workflow.map((item) => (
                <article key={item.step} className="bg-white p-6 lg:min-h-56">
                  <p className="font-mono text-sm font-semibold text-blue-600">{item.step}</p>
                  <h3 className="mt-8 text-lg font-bold text-slate-950">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="capabilities" className="border-y border-slate-200 bg-slate-950 py-20 text-white sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-400">
                  Core capabilities
                </p>
                <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  Operational clarity at every sourcing milestone
                </h2>
                <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
                  Built around the real work between an Amazon seller, a China
                  sourcing team, and export-ready suppliers.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {capabilities.map((capability) => (
                  <article
                    key={capability.title}
                    className="rounded-xl border border-slate-800 bg-slate-900 p-6"
                  >
                    <span className="font-mono text-xs font-semibold text-blue-400">
                      {capability.number}
                    </span>
                    <h3 className="mt-5 text-lg font-bold">{capability.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      {capability.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
            <div>
              <SectionHeading
                eyebrow="Built for Amazon sellers"
                title="Make sourcing decisions with the full cost picture"
                description="A competitive factory price is only one part of a healthy product. SourceBridge keeps quality, timing, logistics, marketplace fees, and working margin in view."
              />
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {buyerValues.map((value) => (
                  <div key={value} className="flex gap-3 rounded-lg border border-slate-200 p-4">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue-100 text-xs font-black text-blue-700">
                      ✓
                    </span>
                    <p className="text-sm leading-6 text-slate-700">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-blue-200 bg-blue-50">
              <div className="flex items-center justify-between border-b border-blue-200 px-6 py-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                    Demo metrics
                  </p>
                  <p className="mt-1 text-sm text-slate-600">Illustrative data, not operating results</p>
                </div>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-200">
                  DEMO
                </span>
              </div>
              <div className="grid divide-y divide-blue-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                <div className="p-6">
                  <p className="text-3xl font-bold text-slate-950">3–5</p>
                  <p className="mt-2 text-sm leading-5 text-slate-600">business days to first quote set</p>
                </div>
                <div className="p-6">
                  <p className="text-3xl font-bold text-slate-950">2–4</p>
                  <p className="mt-2 text-sm leading-5 text-slate-600">comparable quotes per request</p>
                </div>
                <div className="p-6">
                  <p className="text-3xl font-bold text-slate-950">8</p>
                  <p className="mt-2 text-sm leading-5 text-slate-600">visible sourcing and delivery stages</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-slate-50 py-16">
          <div className="mx-auto flex max-w-5xl flex-col items-center px-4 text-center sm:px-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              Start with a better brief
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Bring your next product idea into one clear sourcing workflow.
            </h2>
            <ButtonLink href="/rfqs/new" className="mt-8 px-6">
              Submit a Sourcing Request <span aria-hidden="true">→</span>
            </ButtonLink>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
