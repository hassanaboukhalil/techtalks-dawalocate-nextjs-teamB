# DawaLocate – AI Project Context & Guidelines

This file is for AI assistants (e.g. Cursor AI, GitHub Copilot Chat) to understand the project and follow our conventions.

You are _not_ a generic boilerplate generator.  
You are a **team member** helping us build a real product.

---

## 1. Project Overview

**Name:** DawaLocate  
**Type:** Full-stack web app (monorepo)  
**Goal:** Help patients in Lebanon (and possibly globally) quickly find which nearby pharmacies currently have a specific medicine in stock and connect patients, donors, pharmacies, and charities around hard-to-find medicines.

### Core Use Cases

1. **Patient search**

   - Search by medicine name + city/area.
   - See list of pharmacies with availability status and contact info.

2. **Pharmacy inventory**

   - Pharmacies manage their profile and medicine inventory:
     - Mark medicines as `IN_STOCK`, `LOW`, or `OUT`.
     - Set quantity and expiry date.

3. **Health profile & QR card**

   - Patients maintain a health profile (conditions, allergies, meds, emergency contact).
   - System generates a **QR health card** that links to a safe summary view.

4. **Donations & requests**

   - Users can **offer** unused, unopened medicines.
   - Users can **request** hard-to-find medicines.
   - Pharmacies/charities can respond “we can help”.

5. **Charity campaigns**

   - Charities create campaigns listing:
     - Needed medicines
     - Target areas
     - How users can help.

6. **Admin console**
   - Approve/reject pharmacies and charities.
   - Manage the master medicine catalog.
   - See basic analytics (counts, etc.).

---

## 2. Tech Stack & Architecture

### Frontend & Backend

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Rendering:** Server Components by default, Client Components when needed
- **Routing style:** App Router route groups (e.g. `(public)`, `(auth)`, `(patient)`, `(pharmacy)`, `(admin)`, `(charity)`)

### Styling

- **CSS:** Tailwind CSS v4
- Shared UI components live in `components/ui/*`.
- We aim for:
  - Semantic HTML
  - Accessible components (labels, focus states, aria attributes)
  - Responsive design

### Backend & Data

- **ORM:** Prisma
- **Database:** PostgreSQL with vercel
- **DB file:** `prisma/schema.prisma`
- **DB access:** via `lib/db.ts` (PrismaClient singleton)

### API Design

- **Important:** We **do not use Server Actions**.
- All backend operations go through **`app/api/*/route.ts`** handlers:
  - Use HTTP verbs (`GET`, `POST`, `PATCH`, `DELETE`) appropriately.
  - Use JSON as request/response format.
  - Use `NextRequest` / `NextResponse`.

### Authentication & Authorization

- **Auth:** Auth.js (NextAuth) with credentials provider.
- **User model** includes a `role` field:
  - `"patient" | "pharmacy" | "admin" | "charity"`
- Sessions should be resolved using a helper in `lib/auth.ts` (e.g. `getCurrentUser()`).
- Route protection:
  - Use middleware and/or checks inside API handlers & layouts.
  - Do **not** expose sensitive data across roles.

---

## 3. High-Level Domain Model (Entities)

AI should follow these core entities (names can slightly vary, but keep meaning consistent):

### Enums

- `UserStatus`: `PENDING | APPROVED | REJECTED`
- `InventoryStatus`: `IN_STOCK | LOW | OUT`
- `DonationOfferStatus`: `OPEN | CLOSED`
- `DonationRequestStatus`: `OPEN | IN_PROGRESS | FULFILLED`

### Models

- `user_types` (UserType)

  - `id` (Int, auto-increment), `name` (`"admin" | "pharmacy" | "charity" | "patient"`, unique), `createdAt`.

- `users` (User)

  - `id` (Int, auto-increment), `name`, `email` (unique), `passwordHash`, `userTypeId` (FK to `user_types`), `city?`, `phone?`, `address?`, `openingHours?`, `hasDelivery?` (default: false), `status?` (UserStatus enum), `createdAt`, `updatedAt`.
  - **Note:** `status` is only used for pharmacy/charity; `NULL` for patients/admins.

- `medicines` (Medicine)

  - `id` (Int, auto-increment), `name`, `genericName?`, `strength?`, `form?`, `synonyms?`, `imageUrl?`, `description?`, `createdAt`, `updatedAt`.
  - **Central medicine catalog** — referenced by pharmacy inventory, donations, requests, and campaigns.
  - **Note:** Same medicine name can exist with different strength/form combinations (e.g., Paracetamol 500mg Tablet vs 1000mg Tablet).

- `pharmacy_medicines` (PharmacyMedicine - Inventory)

  - `id` (Int, auto-increment), `pharmacyId` (FK to `User`), `medicineId` (FK to `Medicine`), `status` (InventoryStatus enum, default: OUT), `quantity` (default: 0), `expiresAt?`, `createdAt`, `updatedAt`.
  - References the central `Medicine` catalog instead of storing medicine details directly.

- `health_profiles` (HealthProfile)

  - `id` (Int, auto-increment), `userId` (FK to `User`, unique), `conditions?`, `allergies?`, `currentMedications?`, `bloodType?`, `emergencyContact?`, `createdAt`, `updatedAt`.

- `donation_offers` (DonationOffer)

  - `id` (Int, auto-increment), `userId` (FK to `User`), `medicineId` (FK to `Medicine`), `city`, `expiry?`, `notes?`, `status` (DonationOfferStatus enum, default: OPEN), `createdAt`, `updatedAt`.

- `donation_requests` (DonationRequest)

  - `id` (Int, auto-increment), `userId` (FK to `User`), `medicineId` (FK to `Medicine`), `city`, `status` (DonationRequestStatus enum, default: OPEN), `createdAt`, `updatedAt`.

- `campaigns` (Campaign)

  - `id` (Int, auto-increment), `charityUserId` (FK to `User`), `title`, `description`, `targetAreas` (string - comma-separated or JSON), `startDate`, `endDate?`, `contactInfo`, `createdAt`, `updatedAt`.
  - Target medicines are stored via the `campaign_medicines` join table (many-to-many).

- `campaign_medicines` (CampaignMedicine)
  - `id` (Int, auto-increment), `campaignId` (FK to `Campaign`), `medicineId` (FK to `Medicine`), `createdAt`, `updatedAt`.
  - Join table linking campaigns to their target medicines.
  - Unique constraint on `(campaignId, medicineId)`.

If you add new tables or fields, keep them consistent with this domain.

---

## 4. Route & Folder Conventions

### App Route Groups

We use route groups in `app/` for clarity by role:

- `(public)` – landing, public campaigns, info pages
- `(auth)` – login & registration
- `(patient)` – patient dashboard, search, health profile & card, donations, requests
- `(pharmacy)` – pharmacy dashboard, profile, inventory, local requests
- `(charity)` – charity dashboard & campaigns management
- `(admin)` – admin console (pharmacies, charities, medicines, dashboard)

**AI: when adding pages, respect these groups.**

### Example Frontend Routes (non-exhaustive)

- `/` – landing (public)
- `/campaigns` – public campaigns list
- `/campaigns/[id]` – campaign details

- `/login` – auth
- `/register`

<!-- - `/patient/dashboard` -->
<!-- - `/patient/search` -->

- `/patient/`
- `/patient/health-profile`
- `/patient/health-card`
- `/patient/donations`
- `/patient/requests`

- `/pharmacy/dashboard`
- `/pharmacy/profile`
- `/pharmacy/inventory`
- `/pharmacy/requests`

- `/charity/dashboard`
- `/charity/campaigns`

- `/admin/dashboard`
- `/admin/pharmacies`
- `/admin/charities`
- `/admin/medicines`

### API Routes (pattern)

Use REST-like routes under `app/api`, **grouped by domain/role**:

- **Auth**

  - `app/api/auth/register/route.ts`
  - `app/api/auth/[...nextauth]/route.ts`

- **Patient**

  - `app/api/patient/search-medicines/route.ts`
  - `app/api/patient/health-profile/route.ts`
  - `app/api/patient/health-card/[userId]/route.ts` // or use a token instead of userId
  - `app/api/patient/donations/route.ts` // patient’s donation offers
  - `app/api/patient/requests/route.ts` // patient’s medicine requests

- **Pharmacy**

  - `app/api/pharmacy/register/route.ts` // create pharmacy + link to user
  - `app/api/pharmacy/profile/route.ts`
  - `app/api/pharmacy/inventory/route.ts`
  - `app/api/pharmacy/requests/route.ts` // view/respond to local requests

- **Charity**

  - `app/api/charity/campaigns/route.ts` // create/manage campaigns for a charity

- **Public (no auth or read-only)**

  - `app/api/public/campaigns/route.ts` // public campaigns list (optional)
  - `app/api/public/health-card/[token]/route.ts` // public read view of health card (optional pattern)

- **Admin**
  - `app/api/admin/pharmacies/route.ts`
  - `app/api/admin/charities/route.ts`
  - `app/api/admin/medicines/route.ts`
  - `app/api/admin/dashboard/route.ts`

**AI: When adding new handlers, follow this structure and reuse existing patterns.**

---

## 5. UI & Design Conventions

### Brand & Colors

- Primary brand color: class `text-primary` or `bg-primary`
- Common usage:
  - Primary buttons and highlights
  - Selected states, key icons
- Backgrounds:
  - Main app background: class `bg-background`
  - Cards: class `bg-card`
- Status colors:
  - In stock: teal
  - Low stock: warm orange
  - Out of stock: red/gray
- Text:
  - Main text: dark gray (e.g. Tailwind `gray-900`)
  - Muted text: Tailwind `gray-500` / `gray-600`

### Components

We organize React components under `components/` into **three main categories**:

```text
components/
├─ layout/           // global layout shell & shared chrome (header, footer, logo…)
├─ pages-components/ // page-specific components, grouped by page/route
└─ ui/               // low-level, reusable UI primitives (buttons, inputs, cards…)
```

### 5.1 `components/layout/`

**Purpose:** Global layout and site chrome used across multiple pages and roles.

**Examples:**

- `components/layout/Header.tsx`
- `components/layout/Footer.tsx`
- `components/layout/Logo.tsx`
- `components/layout/Sidebar.tsx`

**AI Guidelines:**

- If a component is part of the overall frame of the app (nav, footer, sidebars, common shells), put it in `components/layout/`.
- These components should be generic and not depend on a single page’s business logic.
- Prefer composition: e.g. `Header` receives props (`user`, `links`) instead of hard-coding every case.

### 5.2 `components/ui/`

**Purpose:** Reusable, low-level UI primitives with Tailwind styles. try to use shadcn/ui components whenever possible.

**Examples:**

- `components/ui/Button.tsx`
- `components/ui/Input.tsx`
- `components/ui/Textarea.tsx`
- `components/ui/Card.tsx`
- `components/ui/Badge.tsx`
- `components/ui/Table.tsx`

**AI Guidelines:**

- When you see repeated HTML/Tailwind patterns (buttons, form fields, cards), extract them into `components/ui/`.
- Keep these components **dumb and reusable**:
  - Stateless where possible.
  - Don’t hard-code domain-specific text or queries.
- Use these primitives inside `pages-components` and `layout` instead of re-styling from scratch.

### 5.3 `components/pages-components/`

**Purpose:** Page-specific building blocks that are tied to a single page or route.

**Structure:**

```text
components/pages-components/
├─ patient/
│ ├─ DashboardSummary.tsx
│ ├─ SearchForm.tsx
│ └─ SearchResultsList.tsx
├─ pharmacy/
│ ├─ InventoryTable.tsx
│ ├─ InventoryFilters.tsx
│ └─ PharmacyProfileForm.tsx
├─ admin/
│ ├─ PharmacyApprovalTable.tsx
│ ├─ MedicineCatalogTable.tsx
│ └─ StatsOverview.tsx
└─ charity/
  ├─ CampaignForm.tsx
  └─ CampaignCard.tsx
```

**AI Guidelines:**

- If a component is specific to one page or flow (e.g. patient search page, pharmacy inventory page, admin pharmacy approval page), place it under: `components/pages-components/<role or area>/`.
- These components can contain more business logic and can call hooks, fetch data (in client components), etc.
- They should compose primitives from `components/ui/` and layout pieces from `components/layout/`.
- Avoid putting page-specific components directly in `app/...` whenever they are reused within that page or are large enough to deserve their own file.

### 5.4 Where to put new components (Decision Rules)

When adding a new component:

1. **Is it global chrome?** (header, footer, logo, main nav, role shell)
   → Put it in `components/layout/`.

2. **Is it a low-level visual primitive reused across many pages?** (button, input, select, card, table, badge, alert)
   → Put it in `components/ui/`.

3. **Is it tied to one specific page/role?** (patient search form, pharmacy inventory table, admin pharmacies table)
   → Put it in `components/pages-components/<area>/`.

**Always try to reuse existing UI and layout components before creating new ones.** If you need a new generic primitive, add it in `components/ui` and keep it flexible.

---

## 6. Code Style & Best Practices

### General

- Use **TypeScript** everywhere.
- Prefer **named functions** and typed props.
- Keep functions small and focused.
- Avoid duplication (use helpers in `lib/*` when logic repeats).

### Backend / API Handlers

- File naming: `route.ts` inside `app/api/...`
- Always type inputs and outputs when possible.
- Validate input with a schema library (e.g. Zod) in `lib/validations/*`.
- Handle errors gracefully: return meaningful HTTP status codes and JSON error messages.

Example:

```ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "patient") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ...
}
```

## 7. Libraries & Tools We Use

The project uses a set of standard libraries. **AI must prefer these libraries and patterns** instead of introducing random alternatives.

### 7.1 Core Runtime & Framework

- **Next.js 15 (App Router, React 19)**
  - Single full-stack codebase with `app/` router.
  - Use **Server Components** by default; use `use client` only when we need interactivity, hooks, or browser APIs.
- **React**
  - Functional components with hooks.
  - Prefer small, composable components.

---

### 7.2 Data & Backend

- **Prisma**

  - ORM for PostgreSQL, schema in `prisma/schema.prisma`.
  - Use `lib/db.ts` to create and reuse a `PrismaClient` instance.
  - Prefer Prisma queries over raw SQL unless absolutely necessary.
  - When AI adds models or migrations, keep them aligned with the domain model in this file.

- **Axios**
  - For **client-side HTTP calls** to our own APIs (and external APIs if needed).
  - Do **not** use `fetch` on the client if we already have Axios in that component/feature.
  - On the **server** (API routes), we usually talk to the database directly via Prisma, not via Axios.

---

### 7.3 Validation & Forms

- **Zod**

  - For **runtime validation** of request bodies, query params, and forms.
  - Validation schemas live under `lib/validations/*`.
  - Always use Zod to validate data in API routes before using it.
  - When adding new APIs or forms, create/extend a Zod schema.

- **React Hook Form**
  - For complex or user-facing forms (login, register, health profile, inventory forms, campaign forms, etc.).
  - Integrate with Zod via `@hookform/resolvers/zod` when possible.
  - Prefer controlled/uncontrolled patterns recommended by React Hook Form; avoid manually managing tons of `useState` for each field.

---

### 7.4 State Management

- **Context API**

  - For **small, app-wide simple state** (e.g. theme, current language, layout preferences).
  - Keep contexts small and focused.

- **Redux Toolkit (RTK)**
  - For **more complex global state** where we need:
    - Shared data across multiple unrelated components (e.g. user session details, filters, cached search results).
    - Predictable updates, middleware, or devtools.
  - If Redux is used in a feature, follow Redux Toolkit patterns:
    - `createSlice`, `configureStore`, typed hooks (`useAppDispatch`, `useAppSelector`).
  - Do **not** reintroduce legacy Redux patterns (class components, manual reducers without Toolkit).

**AI guidelines:**

- For **simple local state**: use `useState`, `useReducer` inside a component.
- For **cross-page / global state** in a limited scope: prefer Context.
- For **large or complex global state**: prefer Redux Toolkit.

---

### 7.5 Validation & Types

- **TypeScript**

  - Always type component props, API handlers, and helpers.
  - Use types/interfaces for API request/response shapes and share them where reasonable.
  - When adding new types, consider colocating them with the feature or in a dedicated `types` file.

- **Zod + TypeScript**
  - Where possible, use `z.infer<typeof schema>` to generate types from Zod schemas.
  - This avoids duplication between runtime validation and TypeScript types.

---

### 7.6 Icons & UI Enhancements

- **Lucide React**
  - Main icon set for the UI.
  - Import icons from `lucide-react` and keep icons consistent with the design.
  - Do not mix multiple random icon sets.

**AI guidelines:**

- When you need an icon, choose one from Lucide that fits the feature (search, alert, check, etc.).
- Use Tailwind classes to style icons (size, color) rather than inline styles.

---

### 7.7 Testing (Optional / As Needed)

If tests are introduced, prefer:

- **Jest** for unit tests.
- **@testing-library/react** for React component tests.

AI should follow these tools when writing tests, and avoid introducing new testing frameworks unless explicitly requested.

---

### 7.8 General Rules for Using Libraries

1. **Reuse before adding**

   - If a library already exists in `package.json`, **reuse it**.
   - Do not introduce a new library that does the same job (e.g., don’t add `yup` if we’re using `zod`).

2. **Align with existing patterns**

   - For forms, combine **React Hook Form + Zod**.
   - For API data on the client, use **Axios** if consistent with the rest of the code.
   - For validation in API routes, use Zod schemas defined in `lib/validations`.

3. **Keep dependencies minimal**
   - Avoid suggesting heavy libraries for small problems.
   - Prefer standard library or existing utilities where possible.
