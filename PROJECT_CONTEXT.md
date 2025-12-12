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
- **Routing style:** App Router route groups (e.g. (public), (auth), patient, pharmacy, admin, charity)

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
- **User model** includes a `userTypeId` field that references the `UserType` table:
  - UserType names: `"patient" | "pharmacy" | "admin" | "charity"`
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

- `UserType`

  - `id` (Int, auto-increment, PK), `name` (String, unique - `"admin" | "pharmacy" | "charity" | "patient"`), `createdAt` (DateTime), `users` (relation to User[]).

- `User`

  - `id` (Int, auto-increment, PK), `name` (String), `email` (String, unique), `passwordHash` (String), `userTypeId` (Int, FK to UserType), `userType` (relation to UserType), `city?` (String), `phone?` (String), `address?` (String), `openingHours?` (String), `hasDelivery?` (Boolean, default: false), `status?` (UserStatus enum), `createdAt` (DateTime), `updatedAt` (DateTime).
  - **Relations:** `healthProfile` (HealthProfile), `pharmacyMedicines` (PharmacyMedicine[]), `donationOffers` (DonationOffer[]), `donationRequests` (DonationRequest[]), `campaigns` (Campaign[]).
  - **Indexes:** email, userTypeId.
  - **Note:** `status` is only used for pharmacy/charity; `NULL` for patients/admins.

- `Medicine`

  - `id` (Int, auto-increment, PK), `name` (String), `genericName?` (String), `strength?` (String), `form?` (String), `synonyms?` (String), `imageUrl?` (String), `description?` (String), `createdAt` (DateTime), `updatedAt` (DateTime).
  - **Relations:** `pharmacyMedicines` (PharmacyMedicine[]), `donationOffers` (DonationOffer[]), `donationRequests` (DonationRequest[]), `campaignMedicines` (CampaignMedicine[]).
  - **Central medicine catalog** — referenced by pharmacy inventory, donations, requests, and campaigns.
  - **Note:** Same medicine name can exist with different strength/form combinations (e.g., Paracetamol 500mg Tablet vs 1000mg Tablet).

- `PharmacyMedicine`

  - `id` (Int, auto-increment, PK), `pharmacyId` (Int, FK to User), `pharmacy` (relation to User), `medicineId` (Int, FK to Medicine), `medicine` (relation to Medicine), `status` (InventoryStatus enum, default: OUT), `quantity` (Int, default: 0), `expiresAt?` (DateTime), `createdAt` (DateTime), `updatedAt` (DateTime).
  - **Indexes:** pharmacyId, medicineId, status.
  - References the central `Medicine` catalog instead of storing medicine details directly.

- `HealthProfile`

  - `id` (Int, auto-increment, PK), `userId` (Int, FK to User, unique), `user` (relation to User), `fullName?` (String), `dob?` (String), `gender?` (String), `bloodType?` (String), `height?` (String), `weight?` (String), `conditions?` (String), `medications?` (String), `emergencyName?` (String), `emergencyRelation?` (String), `emergencyPhone?` (String), `createdAt` (DateTime), `updatedAt` (DateTime).
  - **Indexes:** userId.

- `DonationOffer`

  - `id` (Int, auto-increment, PK), `userId` (Int, FK to User), `user` (relation to User), `medicineId` (Int, FK to Medicine), `medicine` (relation to Medicine), `city` (String), `expiry?` (DateTime), `notes?` (String), `status` (DonationOfferStatus enum, default: OPEN), `createdAt` (DateTime), `updatedAt` (DateTime).
  - **Indexes:** userId, city, status.

- `DonationRequest`

  - `id` (Int, auto-increment, PK), `userId` (Int, FK to User), `user` (relation to User), `medicineId` (Int, FK to Medicine), `medicine` (relation to Medicine), `city` (String), `status` (DonationRequestStatus enum, default: OPEN), `createdAt` (DateTime), `updatedAt` (DateTime).
  - **Indexes:** userId, city, status.

- `Campaign`

  - `id` (Int, auto-increment, PK), `charityUserId` (Int, FK to User), `charity` (relation to User), `title` (String), `description` (String), `targetAreas` (String - comma-separated or JSON), `startDate` (DateTime), `endDate?` (DateTime), `contactInfo` (String), `createdAt` (DateTime), `updatedAt` (DateTime).
  - **Relations:** `campaignMedicines` (CampaignMedicine[]).
  - **Indexes:** charityUserId, startDate.
  - Target medicines are stored via the `CampaignMedicine` join table (many-to-many).

- `CampaignMedicine`
  - `id` (Int, auto-increment, PK), `campaignId` (Int, FK to Campaign), `campaign` (relation to Campaign), `medicineId` (Int, FK to Medicine), `medicine` (relation to Medicine), `createdAt` (DateTime), `updatedAt` (DateTime).
  - **Indexes:** campaignId, medicineId.
  - **Unique constraint:** `(campaignId, medicineId)`.
  - Join table linking campaigns to their target medicines.

If you add new tables or fields, keep them consistent with this domain.

---

## 4. Route & Folder Conventions

### App Route Groups

We use route groups in `app/` for clarity by role:

- `(public)` – landing, public campaigns, info pages
- `(auth)` – login & registration
- `patient` – patient dashboard, search, health profile & card, donations, requests
- `pharmacy` – pharmacy dashboard, profile, inventory, local requests
- `charity` – charity dashboard & campaigns management
- `admin` – admin console (pharmacies, charities, medicines, dashboard)

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

All colors are defined as CSS variables in `app/globals.css` and should be used via utility classes. **Never hard-code hex values directly in components**.

**Available Color Variables:**

- `--color-primary`: `#2699b2` - Main brand color (teal/cyan)
- `--color-secondary`: `#b7f2ff` - Light secondary color (light cyan)
- `--color-tertiary`: `#094A58` - Dark tertiary color (dark teal)
- `--color-primary-hover`: `#E6F7FB` - Light hover background
- `--color-background`: `#FFFFFF` - Main app background (white)
- `--color-card`: `#F5F7FA` - Card/container background (light gray)
- `--color-green`: `#22C55E` - Success/green color
- `--color-gray`: `#bbbbbb` - Neutral gray
- `--color-warning`: `#FF7A3C` - Warning/orange color
- `--color-error`: `#E53935` - Error/red color

**How to Use Colors:**

Colors are accessed via utility classes defined in `app/globals.css`:

**Background Colors:**

- `bg-primary` - Primary brand background
- `bg-secondary` - Secondary/light background (used for section backgrounds)
- `bg-tertiary` - Dark tertiary background (used for hover effect in button and other use cases)
- `bg-primary-hover` - Light hover background
- `bg-background` - Main app background (white)
- `bg-card` - Card/container background (light gray)
- `bg-green` - Success/green background
- `bg-gray` - Neutral gray background

**Text Colors:**

- `text-primary` - Primary brand text color
- `text-secondary` - Secondary text color
- `text-tertiary` - Dark tertiary text color
- `text-background` - White text (for dark backgrounds)
- `text-gray` - Neutral gray text
- `text-green` - Success/green text

**Common Usage Patterns:**

1. **Primary Actions & Highlights:**

   ```tsx
   // Primary buttons
   <Button className="bg-primary text-white hover:bg-[#094A58]!">
     Submit
   </Button>

   // Text highlights
   <span className="text-primary">Important Text</span>

   // Icon backgrounds
   <div className="bg-secondary p-3 rounded-lg">
     <Icon className="text-primary" />
   </div>
   ```

2. **Section Backgrounds:**

   ```tsx
   // Alternating section backgrounds
   <Section className="bg-secondary">  // Light section
   <Section className="bg-background"> // White section
   <Section className="bg-card">        // Card section
   ```

3. **Cards & Containers:**

   ```tsx
   <div className="bg-card p-6 rounded-xl">{/* Card content */}</div>
   ```

4. **Gradients:**

   ```tsx
   <div className="bg-gradient-to-br from-primary to-secondary">
     {/* Gradient background */}
   </div>
   ```

5. **Status Colors:**

   - In stock: Use `text-green` or `bg-green`
   - Low stock: Use `text-warning` or `bg-warning` (orange)
   - Out of stock: Use `text-gray` or `text-error` (red)

6. **Text Hierarchy:**
   - Main headings: `text-gray-900` (Tailwind class)
   - Body text: `text-gray-700` or `text-gray-600` (Tailwind classes)
   - Muted text: `text-gray-500` or `text-gray-600` (Tailwind classes)

**Important Notes:**

- **Always use utility classes** (`bg-primary`, `text-primary`, etc.) instead of hard-coding hex values
- For hover states that need the tertiary color, you can use: `hover:bg-(--color-tertiary)!` (with `!` for important override)
- For borders, use: `border-primary`, `border-secondary`, etc.
- When using Tailwind's built-in gray scale (`gray-900`, `gray-600`, etc.), these are fine to use directly
<!-- - The color system is designed to work with both light and dark modes (dark mode variables are defined in `globals.css`) -->

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

**Purpose:** Reusable, low-level UI primitives with Tailwind styles. We use shadcn/ui components whenever possible.

**Available Components:**

The following UI components are available and **must be reused** instead of creating new ones:

- `components/ui/button.tsx` - **Button component** (variants: default, destructive, outline, secondary, ghost, link; sizes: default, sm, lg, icon, icon-sm, icon-lg)
- `components/ui/input.tsx` - **Input component** for text inputs
- `components/ui/textarea.tsx` - **Textarea component** for multi-line text
- `components/ui/select.tsx` - **Select component** (with SelectTrigger, SelectContent, SelectItem, SelectValue)
- `components/ui/card.tsx` - **Card components** (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction)
- `components/ui/table.tsx` - **Table components** (Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption, TableActions, TableEmpty)
- `components/ui/label.tsx` - **Label component** for form labels
- `components/ui/dialog.tsx` - **Dialog component** for modals
- `components/ui/CityAutocomplete.tsx` - **CityAutocomplete** for city selection
- `components/ui/OpeningHoursInput.tsx` - **OpeningHoursInput** for pharmacy opening hours
- `components/ui/LogoutButton.tsx` - **LogoutButton** for logout functionality

**AI Guidelines:**

- **CRITICAL: Always reuse existing UI components before creating new ones.**
  - **DO NOT** create buttons from scratch - use `@/components/ui/button`
  - **DO NOT** create inputs from scratch - use `@/components/ui/input`
  - **DO NOT** create selects from scratch - use `@/components/ui/select`
  - **DO NOT** create cards from scratch - use `@/components/ui/card`
  - **DO NOT** create tables from scratch - use `@/components/ui/table`
  - Check `components/ui/` directory first before creating any new UI primitive.
- When you see repeated HTML/Tailwind patterns (buttons, form fields, cards), extract them into `components/ui/`.
- Keep these components **dumb and reusable**:
  - Stateless where possible.
  - Don't hard-code domain-specific text or queries.
- Use these primitives inside `pages-components` and `layout` instead of re-styling from scratch.
- Import components using the `@/components/ui/` alias (e.g., `import { Button } from "@/components/ui/button"`).

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

**CRITICAL: Always reuse existing UI and layout components before creating new ones. Check `components/ui/` directory first. Never create buttons, inputs, selects, cards, or tables from scratch.** If you need a new generic primitive, add it in `components/ui` and keep it flexible.

### 5.5 Component Reuse Requirements

**AI: Before creating any UI element, check if it already exists in `components/ui/`.**

**Common mistakes to avoid:**

1. ❌ Creating a `<button>` with custom classes instead of using `<Button>` from `@/components/ui/button`
2. ❌ Creating an `<input>` with custom classes instead of using `<Input>` from `@/components/ui/input`
3. ❌ Creating a `<select>` with custom classes instead of using `<Select>` from `@/components/ui/select`
4. ❌ Creating custom card layouts instead of using `<Card>` components from `@/components/ui/card`
5. ❌ Creating custom table markup instead of using `<Table>` components from `@/components/ui/table`

**Correct approach:**

```tsx
// ✅ CORRECT: Use existing Button component
import { Button } from "@/components/ui/button";

<Button variant="default" size="lg" onClick={handleClick}>
  Submit
</Button>

// ❌ WRONG: Creating button from scratch
<button className="bg-primary text-white px-4 py-2 rounded">
  Submit
</button>
```

**If a component doesn't exist:**

1. Check if a similar shadcn/ui component exists that can be added
2. Only then create a new component in `components/ui/` following the same patterns

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
