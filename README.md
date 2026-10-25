# 📈 Financial — Real-Time Stock Market Platform

A full-stack financial platform built with **Next.js and TypeScript**, combining real-time market data, authentication, personalized watchlists and alerts, interactive charts, AI-powered insights, news summaries, and background automation.

![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=for-the-badge&logo=typescript) ![Better Auth](https://img.shields.io/badge/Better%20Auth-green?style=for-the-badge) ![Inngest](https://img.shields.io/badge/Inngest-purple?style=for-the-badge)

## Why this project

This project demonstrates practical full-stack engineering beyond a basic CRUD application:

- **Frontend:** Next.js App Router, React and Tailwind CSS
- **Backend:** server-side application logic and API integrations
- **Authentication:** Better Auth
- **Data:** MongoDB/Mongoose
- **Automation:** Inngest event-driven background jobs
- **AI:** automated financial insights and summaries
- **Product features:** watchlists, price alerts, charts and news

## ✨ Features

- 📊 Real-time market prices and asset search
- ⭐ Personalized watchlists
- 🔔 Target-price alerts
- 📉 Interactive historical/live charts
- 🤖 AI-powered market insights
- 📰 Automated financial news summaries
- 🔐 User authentication
- ⚙️ Background jobs and event-driven workflows
- 🌙 Responsive UI with theme support

## 🛠️ Tech Stack

| Area | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| UI | React + Tailwind CSS |
| Authentication | Better Auth |
| Database | MongoDB + Mongoose |
| Background Jobs | Inngest |
| AI | AI provider integrations |
| Validation / Forms | React Hook Form |

## 📁 Architecture

```text
financial/
├── app/             # Routes, pages and server-side application logic
├── components/      # Reusable UI components
├── database/        # Database configuration and models
├── inngest/         # Background jobs and event handlers
├── lib/             # Integrations, utilities and shared services
├── middleware/      # Request/authentication middleware
├── hooks/           # Reusable React hooks
└── public/          # Static assets
```

The application follows a feature-oriented structure where the UI, server logic, persistence, authentication, and background workflows are separated into focused modules.

## 🔄 Main Flow

```text
User
  ↓
Next.js UI
  ↓
Server-side logic / API integrations
  ├── Authentication → Better Auth
  ├── Market data → External provider
  ├── Persistence → MongoDB
  └── Events → Inngest
                ↓
        Alerts / News / AI jobs
```

## 🚀 Getting Started

### Prerequisites

- Node.js 22+
- npm, pnpm, yarn or Bun
- MongoDB
- Credentials for the integrations you want to use

### Installation

```bash
git clone https://github.com/mrJoao28/financial.git
cd financial
npm install
```

### Environment variables

Copy `.env.example` to `.env.local` and fill in the required values:

```bash
cp .env.example .env.local
```

Required integrations include market data, authentication, database, Inngest, and AI credentials depending on the features being used.

### Vercel production setup

A successful build only confirms compilation. Authentication also needs a working
database and secrets **when a request arrives**. In Vercel → Project Settings →
Environment Variables, configure these for **Production**, then redeploy:

| Variable | Production value |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string with a database name, e.g. `mongodb+srv://USER:PASSWORD@CLUSTER/financial`. `DATABASE_URL` is accepted as a fallback for MongoDB URIs only. |
| `BETTER_AUTH_SECRET` | A stable random secret of at least 32 characters. Generate locally with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. |
| `BETTER_AUTH_URL` | `https://financial-8in8.vercel.app` (no `localhost`). If omitted on Vercel, the deployment domain is used automatically. |

In Atlas, ensure the cluster is active, the database user has access to the
selected database, and Network Access permits your Vercel application's outbound
connections. Encode special characters in the database password in the URI.
Do not paste database credentials into issues or logs.

`INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` enable background jobs; leave
`INNGEST_DEV` unset in production. A welcome-job failure does not invalidate a
successfully created account. Other optional integrations are configured separately.

Guests are redirected to `/sign-in` without opening a database connection. Login
and registration pages remain accessible during database outages, but signing
in still requires valid database/auth configuration. A stale or invalid session
never grants access to the dashboard. Database connection attempts time out after
five seconds; a failed attempt can be retried on the next request.

After deployment, check `/`, `/sign-in`, `/sign-up`, and a full sign-in flow.
If authentication fails, inspect Vercel Runtime Logs and the Production variables;
the build status alone cannot validate database connectivity.

> ⚠️ Never commit `.env.local` or real API keys. The repository contains `.env.example` as a safe configuration template.

### Development

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

### Background jobs

For local Inngest development, run the Inngest development server alongside Next.js:

```bash
npx inngest-cli@latest dev
```

## 🧪 Quality checks

Before opening a pull request, run:

```bash
npm run lint
npm test
npm run build
npm run test:smoke
```

The smoke tests run the compiled production server without credentials and with
an unreachable database, checking guest redirects, login/registration rendering,
stale sessions, and controlled auth API failures. They never contact a production
database. A successful authenticated sign-in still needs a configured environment.

## 🔐 Security notes

- Secrets belong in environment variables and must not be committed.
- Authentication is handled through Better Auth rather than storing plaintext passwords.
- External integrations should be configured with server-side secrets.
- Production deployments should use secure, environment-specific credentials and database access rules.

## 🤝 Contributing

Issues and pull requests are welcome. For meaningful changes, explain the problem being solved and include the relevant validation steps.

## 👤 Author

**João** — [@mrJoao28](https://github.com/mrJoao28)
