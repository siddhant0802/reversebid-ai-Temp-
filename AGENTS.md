# ReverseHub AI Project Notes

## Project overview
ReverseHub AI is a React + TypeScript reverse marketplace application where buyers post requirements and suppliers compete by submitting offers.

## Core architecture
- Admin entities (users, suppliers/verifications, fraud alerts, admin log) live in the shared client store in src/lib/store.ts, with seeded data in src/lib/admin-data.ts.
- The admin workspace uses the same source of truth as buyer and seller workflows so orders, quotes, and verification records stay consistent across the product.

## Local development
1. Install dependencies with npm install.
2. Run the app with npm run dev.
3. Build for production with npm run build.
4. Preview the production build with npm run preview.

## Main folders
- src/routes: route-level pages and layouts
- src/components: reusable UI and feature components
- src/lib: shared state, mock data, scoring, and utilities
- public: static assets
