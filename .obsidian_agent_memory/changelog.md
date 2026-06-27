# Changelog

## [2026-06-25] - GSAP Integration & Memory Initialization
- Initialized local Obsidian Agent Memory `.obsidian_agent_memory`.
- Cloned official `greensock/gsap-skills` into the `.agents/` customization directory.
- Registered non-standard skills path via `.agents/skills.json`.

## [2026-06-25] - Infrastructure & Deployment
- Set up Vercel production deployment (`vercel.json`) with backend API proxy rewrites to Render.
- Hardcoded `localhost:3001` fetch requests stripped out in favor of dynamic `/api/*` resolution.
- Enforced a root `.gitignore` prior to commit to prevent the `.env` file from leaking `FMP_API_KEY` and `GROQ_API_KEY` to public GitHub repositories.

## [2026-06-21] - UI Hero Refactor
- Fixed a major scroll synchronization bug where Framer Motion couldn't track scroll progress due to parent container `overflow: hidden` restrictions. Passed `scrollContainerRef` globally.
- Corrected Dark Mode browser extension inversions by forcefully declaring `#fff` text and standardizing background colors across buttons and trending cards.
- Restructured `ws-hero-sticky` flex layout and resolved `position: absolute` collisions.
