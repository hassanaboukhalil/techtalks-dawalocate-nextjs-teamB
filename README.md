![DawaLocate Banner](./readme-images/readme-banner.png)

# DawaLocate

**Medicine Access Platform for Lebanon**

DawaLocate is a full-stack web application that helps patients in Lebanon locate essential medicines at nearby pharmacies while connecting donors, pharmacies, and charities to address medication shortages and accessibility challenges.

## 📋 Overview

DawaLocate serves as a bridge between patients seeking medications and pharmacies, donors, and charitable organizations that can provide them. The platform enables:

- **Patients** to search for medicines, find nearby pharmacies, request donations, and manage their health profiles
- **Pharmacies** to manage inventory, participate in donation campaigns, and fulfill medication requests
- **Charities** to create donation campaigns, manage requests, and coordinate medication distribution
- **Administrators** to oversee the platform, approve pharmacy/charity registrations, and manage the medicine catalog

## ✨ Features

### For Patients

- Real-time medicine search across participating pharmacies
- Pharmacy location mapping and filtering by city
- Digital health profile with medical conditions and medication history
- Request medications from donors and charities
- Participate in donation campaigns
- Digital ID card generation for health profiles

### For Pharmacies

- Comprehensive inventory management with stock status tracking
- Campaign participation and donation fulfillment
- Medication request handling
- Opening hours and profile management
- Account approval workflow

### For Charities

- Create and manage donation campaigns
- Process medication requests from patients
- Track donations and campaign progress
- Verify patient eligibility through health profiles

### For Administrators

- User approval system (pharmacies and charities)
- Medicine catalog management
- Platform oversight and monitoring
- User role management

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js (Auth.js) with credentials provider
- **Styling:** Tailwind CSS v4
- **Email:** Nodemailer (SMTP)
- **UI Components:** Custom component library with shadcn/ui patterns
- **HTTP Client:** Axios

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- SMTP email service (e.g., Gmail)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd dawalocate
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/dawalocate"

   # NextAuth
   NEXTAUTH_SECRET="your-secret-key"  # Generate with: openssl rand -base64 32
   NEXTAUTH_URL="http://localhost:3000"

   # Email (SMTP)
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"
   ```

4. **Set up the database**

   ```bash
   # Generate Prisma client
   npx prisma generate

   # Push schema to database
   npx prisma db push

   # Seed database with initial data
   npx prisma db seed
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
dawalocate/
├── app/                      # Next.js App Router
│   ├── (public)/            # Public pages (landing, campaigns)
│   ├── (auth)/              # Authentication pages (login, signup)
│   ├── patient/             # Patient dashboard and features
│   ├── pharmacy/            # Pharmacy dashboard and features
│   ├── charity/             # Charity dashboard and features
│   ├── admin/               # Admin dashboard and features
│   └── api/                 # API routes (no server actions)
├── components/
│   ├── layout/              # Header, Footer, Sidebar, etc.
│   ├── pages-components/    # Page-specific components
│   └── ui/                  # Reusable UI primitives
├── lib/
│   ├── auth.ts              # NextAuth configuration
│   ├── db.ts                # Prisma client singleton
│   └── email.ts             # Email service utilities
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── seed.ts              # Database seeding script
│   └── migrations/          # Database migrations
└── constants/               # App constants and configuration
```

## 🗄️ Database Schema

The application uses PostgreSQL with Prisma ORM. Key models include:

- **User:** Core user accounts with role-based access
- **UserType:** Defines roles (patient, pharmacy, charity, admin)
- **Medicine:** Central medicine catalog
- **PharmacyMedicine:** Pharmacy inventory with stock status
- **HealthProfile:** Patient medical information
- **DonationOffer/DonationRequest:** Donation management
- **Campaign:** Charity-led donation campaigns
- **EmailVerification:** Email verification codes

Run migrations after schema changes:

```bash
npx prisma migrate dev
```

## 🔐 Authentication & Authorization

- Email verification required for signup (6-digit code with 10-minute expiry)
- Role-based access control with 4 user types
- Pharmacy and charity accounts require admin approval
- Session management via NextAuth with JWT
- Protected routes via middleware

## 📧 Email Verification Flow

1. User submits signup → System sends 6-digit code via email
2. Code stored in database with 10-minute expiry
3. User verifies code → Account creation proceeds
4. Resend available after 60-second cooldown

## 🎨 Styling Guidelines

- **Color System:** Use CSS variable utilities (`bg-primary`, `text-secondary`, etc.)
- **Components:** Always use components from `components/ui/` (never raw HTML elements)
- **Responsive:** Mobile-first approach with Tailwind breakpoints
- **Dark Mode:** (If implemented) Supported via CSS variables

## 📜 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema changes to database
npx prisma db seed   # Seed database with initial data
npx prisma studio    # Open Prisma Studio (database GUI)
```

## 🏗️ Development Guidelines

- **API Routes Only:** No Server Actions - use `app/api/*/route.ts` handlers
- **Server Components:** Default for pages; use `"use client"` only when needed
- **Type Safety:** Full TypeScript with Prisma-generated types
- **Component Reuse:** Always check `components/ui/` before creating UI elements
- **Color Variables:** Use utility classes, never hard-code hex values
- **ID Conversion:** Use `parseInt(user.id)` when converting NextAuth string IDs to database integers

## 🆘 Support

For issues and questions, please open an issue in the repository or contact the development team.

---

**Built with ❤️ to help patients in Lebanon access essential medicines**
