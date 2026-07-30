# RentNest
Find & list rental properties with ease — a backend API for a rental property marketplace.

---

## Table of Contents

- [About the Project](#about-the-project)
- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Dependencies](#dependencies)
- [Installation & Setup](#installation--setup)
- [Folder Structure](#folder-structure)
- [License](#license)
- [Contact](#contact)

---

## About the Project
RentNest is a backend-only REST API for a rental property marketplace. Landlords list properties and manage availability, tenants browse listings and submit rental requests, and admins moderate users, listings, and rental activity across the platform. Rentals move through a full lifecycle — request, approval, payment, move-in, and completion — with Stripe handling real payment processing at the approval stage.

---

## Project Overview
Three roles share one API, each scoped to their own permissions:

- **Tenant** — browse/search properties, submit rental requests, pay via Stripe once approved, leave reviews after a completed rental, manage their own profile.
- **Landlord** — create/update/remove property listings, set availability, approve or reject rental requests, view reviews on their properties.
- **Admin** — view and ban/unban users, view all properties and rental requests, manage property categories.

Rental request lifecycle:
```
PENDING → APPROVED/REJECTED → (payment) → ACTIVE → COMPLETED
                                        ↳ (payment fails) → CANCELLED
```

---

## Key Features
- JWT authentication (access + refresh tokens), with role selection at registration
- Property CRUD with search/filter by location, price range, category, and amenities
- Rental request workflow with landlord approve/reject and full status tracking
- Stripe Checkout integration for real payments, with webhook-based confirmation and payment status tracking
- Post-rental reviews, restricted to completed rentals only
- Admin moderation: user ban/unban, platform-wide visibility into listings and rentals
- Centralized, structured error responses (`{ success, message, errorDetails }`) across the whole API
- Request validation on every endpoint via Zod schemas

---

## Tech Stack
**Backend:** Node.js · Express.js · TypeScript
**Database:** PostgreSQL · Prisma ORM (with `@prisma/adapter-pg` driver adapter)
**Auth & Validation:** JWT (jsonwebtoken) · bcryptjs · Zod
**Payments:** Stripe
**Deployment:** Vercel

---

## Dependencies
```json
{
  "@prisma/adapter-pg": "^7.8.0",
  "@prisma/client": "^7.8.0",
  "bcryptjs": "^3.0.3",
  "cookie-parser": "^1.4.7",
  "cors": "^2.8.6",
  "dotenv": "^17.4.2",
  "express": "^5.2.1",
  "http-status": "^2.1.0",
  "jsonwebtoken": "^9.0.3",
  "pg": "^8.22.0",
  "slugify": "^1.6.9",
  "stripe": "^22.3.2",
  "zod": "^4.4.3"
}
```

---

## Installation & Setup

1. Clone the repo and install dependencies:

```bash
git clone https://github.com/TutulMajumder/RentNest_Backend
cd RentNest_Backend
npm install
```

2. Set up environment variables by creating a `.env` file in the root directory (see `.env.example` for the full list):

```env
PORT=5000
DATABASE_URL=your_postgres_connection_url

BCRYPT_SALT_ROUNDS=your_bcrypt_salt_rounds

JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_ACCESS_EXPIRES_IN=your_jwt_access_expires_in
JWT_REFRESH_EXPIRES_IN=your_jwt_refresh_expires_in

APP_URL=your_app_url

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

3. Run database migrations:

```bash
npx prisma migrate dev
```

4. Seed an admin account (creates `admin@rentnest.com` / `admin123` — safe to re-run, it skips if the admin already exists):

```bash
npm run seed
```

5. Run the application in development mode:

```bash
npm run dev
```

6. To test Stripe webhooks locally, forward events with the Stripe CLI:

```bash
npm run stripe:webhook
```

7. Build and run in production mode:

```bash
npm run build
npm start
```

---

## Folder Structure

```plaintext
RentNest/
│
├── api/
│   └── index.ts
├── prisma/
│   ├── migrations/
│   ├── schema/
│   │   ├── category.prisma
│   │   ├── enums.prisma
│   │   ├── payment.prisma
│   │   ├── property.prisma
│   │   ├── rental_request.prisma
│   │   ├── review.prisma
│   │   ├── schema.prisma
│   │   └── user.prisma
│   └── seed.ts
├── src/
│   ├── config/
│   │   └── index.ts
│   ├── lib/
│   │   ├── prisma.ts
│   │   └── stripe.ts
│   ├── middlewares/
│   │   ├── auth.ts
│   │   ├── globalErrorHandler.ts
│   │   ├── notFound.ts
│   │   └── validate.ts
│   ├── modules/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── categories/
│   │   ├── payment/
│   │   ├── properties/
│   │   ├── rentalRequests/
│   │   └── review/
│   │       ├── *.controller.ts
│   │       ├── *.interface.ts
│   │       ├── *.route.ts
│   │       ├── *.service.ts
│   │       └── *.validation.ts
│   ├── utils/
│   │   ├── appError.ts
│   │   ├── catchAsync.ts
│   │   ├── jwt.ts
│   │   └── sendResponse.ts
│   ├── app.ts
│   └── server.ts
├── .env.example
├── prisma.config.ts
├── RentNest.postman_collection.json
├── tsconfig.json
├── vercel.json
└── package.json
```

---

## License
Distributed under the MIT License. See `LICENSE.txt` for more information.

---

## Contact

**Live URL:** [Live Site](https://rent-nest-backend-green.vercel.app/)
**GitHub:** [TutulMajumder](https://github.com/TutulMajumder)
**Email:** [majumder.tutul.364@gmail.com](mailto:majumder.tutul.364@gmail.com)
**Portfolio:** [Portfolio](https://tutul-portfolio.vercel.app/)
