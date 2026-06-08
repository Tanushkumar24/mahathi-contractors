# MBC — Mahathi Building Contractors

Official repository for rebuilding the MBC public website and a separate admin dashboard.

**Tagline**

"Today Under Construction. Tomorrow Your Dream Home."

**Owner**

Simhadri Sampath Kumar

## Overview

- This repository will be restructured into two main parts:
  - `web/` — Public Next.js website (deploy to Vercel)
  - `admin/` — Admin dashboard (Next.js, separate project/site)
- Backend (recommended in a separate `api/` repo or `api/` folder): Node.js + Express + Prisma (PostgreSQL) — deploy to Railway.

## Tech Stack

- Frontend: Next.js + React + Tailwind CSS
- Backend: Node.js + Express
- Database: PostgreSQL + Prisma ORM
- WhatsApp / SMS: Twilio or Meta Business API (provider to be confirmed)

## Goals for this rebuild

- Remove all old branding and demo code.
- Remove AI features, blog pages, and any sample/placeholder content.
- Deliver a focused, mobile-first public site for construction services, bookings, site visits, quotes, and enquiries.
- Provide a separate, secure admin dashboard at `admin.mahathicontractors.in`.

## Quick Contact (header/footer)

- Phone: 8688074469
- WhatsApp: 8688074469
- Email: mahathicontractors@gmail.com

## Services (to display above the fold)

- House Construction
- Residential Construction
- Commercial Construction
- Renovation Works
- Interior Works
- Painting Works
- Epoxy Flooring
- Electrical Works
- Plumbing Works
- Civil Contracting

## Above-the-fold requirements

- Immediately visible on page load (no scroll):
  - Services or quick service links
  - Contact details (phone/email/WhatsApp)
  - Action buttons: Call Now, WhatsApp, Book Now, Book Site Visit, Get Free Quote

## Booking flow (high level)

1. Customer enters mobile number.
2. System sends WhatsApp OTP.
3. Customer enters OTP.
4. OTP is verified.
5. Booking is saved and confirmations are sent to customer and admins.

### Booking form fields

- Full Name
- Mobile Number (required)
- Service Required
- Property Address
- Preferred Date
- Additional Notes

## WhatsApp notifications

- Send customer confirmation with Booking ID, Name, Service, Date, Location, Status.
- Notify Admins (8688074469, 9398158902) instantly with booking details.
- Send booking status updates automatically to customer and admins.

## Security & Admin

- Admin area must be separate and protected with JWT + hashed passwords + role-based access.
- Public users must never see admin links or controls.

## Scroll behavior

- Pages must always open at the top (no automatic scroll to lower sections).
- Use smooth scrolling only for intentional in-page navigation.

## Environment / Secrets (example `.env`)

```
# Database
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE

# JWT
JWT_SECRET=your_jwt_secret

# WhatsApp/Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890

# Admin contacts (comma-separated)
ADMIN_WHATSAPP_NUMBERS=+918688074469,+919398158902
```

## Local development (recommended)

1. Install Node.js 18+ and your package manager (npm, pnpm, or yarn).
2. Scaffold `web/` and `admin/` Next.js apps or convert existing frontend into `web/`.
3. Create `api/` for backend (Node + Express + Prisma) or keep backend in a separate repo.

Example create Next.js app (if starting fresh):

```bash
npx create-next-app@latest web --experimental-app
cd web
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Backend quickstart:

```bash
mkdir api && cd api
npm init -y
npm install express prisma @prisma/client dotenv jsonwebtoken bcryptjs
npx prisma init --datasource-provider postgresql
```

## Next steps (immediate)

1. Audit the current repository and list old/AI/Blog/Auth/demo files to remove. (in progress)
2. Remove demo code and unused dependencies.
3. Scaffold `web/` Next.js app and implement the homepage per above-the-fold requirements.
4. Scaffold `api/` backend with Prisma schema for Services, Bookings, Leads, Admins.
5. Implement WhatsApp OTP flow and notification logic using chosen provider.

## What I need from you

- Confirm WhatsApp provider: Twilio, Meta Business API, or other.
- Provide API credentials (or instruct me to keep placeholders in `.env`).

## Deployment

- Frontend: Vercel (one project for public site, separate project for admin)
- Backend: Railway (use environment variables for secrets)

---

README replaced with MBC-focused content and immediate next steps.
