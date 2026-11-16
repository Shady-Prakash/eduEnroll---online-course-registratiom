# Project Description

The Course All is a full-stack learning management system. It supports both admin and user manage the courses. The dashboard is designed for mobile and desktop, ensuring accessibility and security with multi-factor authentication using clerk and stripe payment.



## Running locally in development mode


#### To get started, just clone the repository and run yarn install && yarn run dev or npm install && npm run dev:

```
git clone https://github.com/Shady-Prakash/Learning-Management-System.git`
npm install or yarn install
npm run dev or yarn run dev
```



## Environment variables (`.env.local`)

The app needs API keys for the database, Clerk, Stripe, Mux and UploadThing. Keep them in a local env file so they never get committed. Both `.env` and `.env*.local` are already listed in `.gitignore`.

#### 1. Create the files

Create a `.env.local` file in the project root, next to `package.json`, for the app's secrets. Next.js loads it automatically when you run `npm run dev` / `yarn dev`.

> **Important:** the Prisma CLI (`prisma generate`, `prisma db push`, `prisma migrate`) reads only `.env`, **not** `.env.local`. Put `DATABASE_URL` in a `.env` file as well, or keep all the variables in `.env`.

```
.env          → DATABASE_URL (read by Prisma and Next.js)
.env.local    → all other keys (read by Next.js)
```

#### 2. Fill in the values

```env
# --- App ---
# Base URL used for Stripe success/cancel redirects
NEXT_PUBLIC_APP_URL=http://localhost:3000

# --- Database (MySQL, used by Prisma) → put this one in .env ---
# Format: mysql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL=

# --- Clerk (authentication) — https://dashboard.clerk.com → API Keys ---
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# --- UploadThing (file uploads) — https://uploadthing.com/dashboard → API Keys ---
UPLOADTHING_TOKEN=

# --- Mux (video processing/playback) — https://dashboard.mux.com → Settings → Access Tokens ---
MUX_TOKEN_ID=
MUX_TOKEN_SECRET=

# --- Stripe (subscriptions) — https://dashboard.stripe.com/test/apikeys ---
STRIPE_API_KEY=
STRIPE_WEBHOOK_SECRET=

# --- Optional: subscription pass display settings ---
# NEXT_PUBLIC_PASS_MONTHLY_PRICE=
# NEXT_PUBLIC_PASS_TRIAL_DAYS=
```

#### 3. Set up the database and Stripe webhook

```
npx prisma generate
npx prisma db push
```

To receive Stripe webhooks locally, install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and run:

```
stripe listen --forward-to localhost:3000/api/webhook
```

Copy the `whsec_...` secret it prints into `STRIPE_WEBHOOK_SECRET`.

#### Notes
- Restart the dev server after changing any env file. Values are only read at startup.
- Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never put secret keys in them.
- Never commit `.env` or `.env.local`. Share the variable **names** (like the template above), not the values.
- When deploying (e.g. Vercel), add the same variables in the hosting provider's environment settings.



## Technologies Used
- **Next.js**: For fast, responsive frontend.
- **TypeScript**: Ensures type safety and code reliability
- **Prisma**: For database management.
- **Clerk**: For secure authentication.
- **Stripe**: To handle secure payments.
- **Shadcn/ui**: Designed component library for frontend.
- **React-Hook-Form with Zod**: Form handling for both client-side and server-side.

