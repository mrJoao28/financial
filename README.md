# 📈 Financial — Real-Time Stock Market App
 
A real-time stock market platform built with **Next.js**, featuring live prices, powerful search, personalized alerts, interactive charts, AI-powered insights, and daily news summaries — all in one place.
 
![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=for-the-badge&logo=typescript) ![Better Auth](https://img.shields.io/badge/Better%20Auth-green?style=for-the-badge) ![Inngest](https://img.shields.io/badge/Inngest-purple?style=for-the-badge)
 
---
 
## ✨ Features
 
- 📊 **Live Stock Prices** — Real-time market data for stocks, indices, and more
- 🔍 **Smart Search** — Instantly find tickers, companies, and assets
- 🔔 **Personalized Alerts** — Get notified when a stock hits your target price
- 📉 **Interactive Charts** — Explore historical and live price movement with rich visualizations
- 🤖 **AI-Powered Insights** — Automated analysis and summaries to help you understand market trends
- 📰 **Daily News Summary** — Curated financial news delivered automatically
- ⭐ **Watchlists** — Track and organize the stocks you care about
- 🔐 **Secure Authentication** — Powered by Better Auth
- ⚙️ **Background Automation** — Event-driven workflows (alerts, summaries, jobs) powered by Inngest
---
 
## 🛠️ Tech Stack
 
| Category | Technology |
|---|---|
| Framework | [Next.js](https://nextjs.org) (App Router) |
| Language | TypeScript |
| Authentication | [Better Auth](https://www.better-auth.com/) |
| Background Jobs / Automation | [Inngest](https://www.inngest.com/) |
| Styling | Tailwind CSS |
| Charts | Interactive charting library |
| AI Insights | AI-powered analysis engine |
 
---
 
## 🚀 Getting Started
 
### Prerequisites
 
- Node.js 18+
- npm / yarn / pnpm / bun
- A stock market data API key (see [Environment Variables](#-environment-variables))
### Installation
 
```bash
git clone https://github.com/mrJoao28/financial.git
cd financial
npm install
```
 
### Environment Variables
 
Create a `.env.local` file in the root directory and add the required keys:
 
```env
# Stock market data provider
STOCK_API_KEY=your_api_key_here
 
# Better Auth
BETTER_AUTH_SECRET=your_secret_here
BETTER_AUTH_URL=http://localhost:3000
 
# Inngest
INNGEST_EVENT_KEY=your_event_key_here
INNGEST_SIGNING_KEY=your_signing_key_here
 
# AI Insights provider
AI_API_KEY=your_ai_api_key_here
 
# Database
DATABASE_URL=your_database_connection_string
```
 
> ⚠️ Never commit your `.env.local` file. Make sure it's listed in `.gitignore`.
 
### Running the Development Server
 
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
 
Open [http://localhost:3000](http://localhost:3000) in your browser to see the app running.
 
### Running Inngest Locally (Background Jobs)
 
To test background automation (alerts, news summaries, etc.) locally, run the Inngest dev server alongside the app:
 
```bash
npx inngest-cli@latest dev
```
 
---
 
## 📁 Project Structure
 
```
financial/
├── app/                # Next.js app router pages & layouts
├── components/         # Reusable UI components
├── lib/                # Utilities, API clients, and helpers
├── inngest/             # Inngest functions & event handlers
├── public/             # Static assets
└── ...
```
 
---
 
## 🗺️ Roadmap
 
- [ ] Portfolio performance tracking
- [ ] Multi-currency support
- [ ] Mobile app version
- [ ] Custom AI insight prompts per user
---
 
## 🤝 Contributing
 
Contributions, issues, and feature requests are welcome!
Feel free to check the [issues page](https://github.com/mrJoao28/financial/issues) or open a pull request.
 
---
 
 
## 👤 Author
 
**João** — [@mrJoao28](https://github.com/mrJoao28)
