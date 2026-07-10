# SourceBridge

SourceBridge is a frontend MVP for a cross-border sourcing platform that connects overseas Amazon sellers with supplier sourcing operations in China. It brings product requirements, comparable quotes, landed cost estimates, sample approval, quality inspection, production, and international shipping milestones into one buyer-facing workflow.

## Local development

Requirements:

- Node.js 22.13 or later
- npm

Install dependencies and start the development site:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

Other useful checks:

```bash
npm run lint
npm run build
npm run start
```

## Implemented in this MVP

- Responsive marketing homepage with workflow, capabilities, buyer value, and clearly labeled demo metrics
- Buyer dashboard with summary cards, five demo RFQs, status filtering, responsive list/table views, and RFQ navigation
- Four-step sourcing request form with accessible required-field semantics, ASIN/URL and commercial input validation, focused error feedback, demo file selection, review/edit controls, success confirmation, and redirect
- RFQ detail experience with status, full timeline, specifications, attachments, two anonymized supplier quotes, quote selection, and an interactive cost/profit estimate
- Shared layout, button, status, loading, empty, and error components
- App Router metadata and a SourceBridge social preview image

## Demo data and limitations

All RFQs, supplier IDs, quotes, fees, costs, dates, and profitability values are illustrative mock data. The application does not create real accounts, save form submissions, upload files, place orders, process payments, call Amazon, scrape websites, or connect to third-party services.

The dynamic RFQ route reuses the same detailed demo specification and quote set for prototype purposes. Refreshing the page resets all form and quote-selection state.

## Next phase

The next phase is planned to add Supabase for persistent records and file metadata, plus a real authentication and role-based permission system for buyers and platform operators. Integrations such as Amazon data, payments, supplier operations, and logistics should only be added after the core data model and access controls are established.
