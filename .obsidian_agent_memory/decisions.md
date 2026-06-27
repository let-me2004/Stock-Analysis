# Decisions

## GSAP Integration over Framer Motion Expansion
- **Context**: The user requested highly polished, professional-grade UI transitions similar to Apple's websites.
- **Decision**: Integrated official GSAP agent skills rather than attempting to brute-force advanced scroll-linked sequences entirely in pure Framer Motion or CSS.
- **Why**: GSAP's `ScrollTrigger` and timeline controls offer strictly superior performance and sequencing capabilities for complex landing pages compared to Framer Motion's declarative variants, especially when dealing with nested elements.

## Vercel + Render Deployment Split
- **Context**: User wanted to host the application for free.
- **Decision**: Frontend statically deployed to Vercel, Backend as a web service on Render.
- **Why**: Render's free tier for node servers is generous but spins down on inactivity. Vercel's edge network serves the frontend instantly regardless of backend state, providing a fast initial load. We used `vercel.json` rewrites to proxy `/api` calls safely without exposing backend infrastructure details directly.
