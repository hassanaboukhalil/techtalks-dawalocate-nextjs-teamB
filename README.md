![DawaLocate Banner](./readme-images/readme-banner.png)

# DawaLocate

**Medicine Access Platform for Lebanon**

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
<!-- ![License](https://img.shields.io/badge/license-MIT-blue) -->

DawaLocate is a full-stack web application that helps patients in Lebanon locate essential medicines at nearby pharmacies while connecting donors, pharmacies, and charities to address medication shortages and accessibility challenges.

## 📑 Table of Contents

- [🔎 Overview](#🔎-overview)
- [💡 Why DawaLocate?](#💡-why-dawalocate)
- [✨ Features](#✨-features)
- [🛠️ Tech Stack](#🛠️-tech-stack)
- [🚀 Getting Started](#🚀-getting-started)
- [📁 Project Structure](#📁-project-structure)
- [🗄️ Database Schema](#🗄️-database-schema)
- [🔐 Authentication & Authorization](#🔐-authentication--authorization)
- [🎨 Styling Guidelines](#🎨-styling-guidelines)
- [🏗️ Development Guidelines](#🏗️-development-guidelines)
- [🆘 Support](#🆘-support)

## 🔎 Overview

![DawaLocate Hero Section](./readme-images/www.dawalocate.com_landing_hero.png)

DawaLocate serves as a bridge between patients seeking medications and pharmacies, donors, and charitable organizations that can provide them. The platform enables:

- **Patients** to search for medicines, find nearby pharmacies, request donations, and manage their health profiles
- **Pharmacies** to manage inventory, participate in donation campaigns, and fulfill medication requests
- **Charities** to create donation campaigns, manage requests, and coordinate medication distribution
- **Administrators** to oversee the platform, approve pharmacy/charity registrations, and manage the medicine catalog

## 💡 Why DawaLocate?

Lebanon is facing severe medicine shortages and accessibility challenges. Patients struggle to find essential medications, while donations and resources remain disconnected from those who need them most.

DawaLocate bridges this gap by:

- **Connecting stakeholders** - Patients, pharmacies, charities, and donors in one unified platform
- **Enabling access** - Real-time medicine search and location-based pharmacy finder
- **Facilitating donations** - Streamlined donation campaigns and request fulfillment
- **Building transparency** - Clear tracking of medicine availability and donation impact
- **Serving Lebanon** - Localized for Lebanese cities, phone formats, and healthcare context

## ✨ Features

### For Patients 🧑‍⚕️

- Real-time medicine search across participating pharmacies
- Pharmacy location mapping and filtering by city
- Digital health profile with medical conditions and medication history
- Request medications from donors and charities
- Participate in donation campaigns
- Digital ID card generation for health profiles

### For Pharmacies 🏥

- Comprehensive inventory management with stock status tracking
- Campaign participation and donation fulfillment
- Medication request handling
- Opening hours and profile management
- Account approval workflow

### For Charities 🤝

- Create and manage donation campaigns
- Process medication requests from patients
- Track donations and campaign progress
- Verify patient eligibility through health profiles

### For Administrators 🛡️

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

<!-- ## Troubleshooting

### Email Verification Not Working

**Problem:** Verification codes not being sent

**Solution:**

1. Check SMTP credentials in `.env.local`
2. For Gmail: Enable "App Passwords" (not regular password)
3. Allow "Less secure app access" if not using App Password
4. Verify SMTP_HOST and SMTP_PORT are correct
5. Check email service isn't rate-limiting requests

### Prisma Client Generation Error

**Problem:** `Error: Failed to generate Prisma Client`

**Solution:**

1. Regenerate client: `npx prisma generate`
2. Clear cache: `rm -rf node_modules/.prisma && npm install`
3. Check `prisma/schema.prisma` for syntax errors
4. Ensure database is accessible

### Port 3000 Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**

1. Find process using port: `lsof -i :3000` (macOS/Linux) or `netstat -ano | findstr :3000` (Windows)
2. Kill process: `kill -9 <PID>` or use Task Manager (Windows)
3. Or use different port: `npm run dev -- -p 3001`

### CORS or Authentication Issues

**Problem:** API requests failing with 401/403 errors

**Solution:**

1. Ensure user is authenticated: Check NextAuth session
2. Verify user role matches endpoint requirements
3. Check middleware.ts for route protection logic
4. Clear browser cookies and try again
5. Review API endpoint role checks in route handlers -->

<!-- ## Security

We prioritize user safety and data protection:

**Authentication & Authorization**

- Email verification required for all signups (6-digit code with 10-minute expiry)
- Secure password hashing using bcrypt (min 8 chars, upper/lower/numbers/special chars)
- Role-based access control (RBAC) with 4 user types
- JWT-based session management via NextAuth.js

**Data Protection**

- HTTPS encryption for all data in transit
- SQL injection prevention via Prisma ORM parameterized queries
- XSS protection via React's automatic escaping
- CSRF tokens on all state-changing operations
- Rate limiting on authentication endpoints (60 seconds between resend codes)

**User Privacy**

- Health profiles only visible to authenticated users
- Personal data only shared with explicit user consent
- No data sold or shared with third parties
- GDPR-compliant data handling practices

**Reporting Security Vulnerabilities**

If you discover a security vulnerability, please email **info@dawalocate.com** instead of using the public issue tracker. Include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

We take security seriously and will respond within 48 hours. -->

<!-- ## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository** and create a feature branch
2. **Follow coding standards** - See `.github/copilot-instructions.md`
3. **Write tests** for new features
4. **Create a Pull Request** with clear description of changes
5. **Link related issues** in PR description -->

## 🆘 Support

For issues and questions:

- **Report a bug:** [Create an issue](../../issues/new)
- **Request a feature:** [Suggest an idea](../../discussions) (if enabled)
- **Security vulnerability:** Email info@dawalocate.com

---

**Built with ❤️ to help patients in Lebanon access essential medicines**
