# Architecture

## Overview
Institutional Stock Analysis Web Application built for high-performance financial data rendering. 

## Technology Stack
- **Frontend**: React (Vite), Framer Motion (for current UI animations), Tailwind/Vanilla CSS.
- **Backend**: Node.js, Express.
- **APIs**: Financial Modeling Prep (FMP), Groq (LLM insights), Yahoo Finance.

## Data Flow
- Frontend fetches data from the Express backend via relative `/api/*` endpoints.
- Backend orchestrates requests to external APIs (FMP, Groq) using environment variables for authentication.
- Proxied through Vercel's `vercel.json` routing layer in production.

## Design Decisions
- Adopted vanilla CSS for granular animation control and styling to achieve an "Apple Vision Pro" like aesthetic.
- Deployed frontend to Vercel and backend to Render for a zero-cost, high-performance edge/serverless architecture.
- Added GSAP skills directly via the `.agents` customization folder for advanced UI development moving forward.
