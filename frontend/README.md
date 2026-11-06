# Cooket frontend

React + TypeScript, Vite, and Tailwind CSS. The cream and green theme is defined in `src/index.css`; the search page is in `src/App.tsx` and recipe cards are in `src/RecipeCard.tsx`.

Run the backend in one terminal (`cd backend`, then `npm start`). In another terminal, from the repository root:

```sh
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. Vite proxies `/api` and `/health` to the backend at http://localhost:3000, so keep both running. If you change the backend port, update `vite.config.ts`.

The Tavily API key stays in `backend/.env.local`; the frontend does not need any secrets.

`npm run build` checks TypeScript and produces `dist/`. `npm run preview` only serves the built static files; it does not run the backend or the development API proxy. A production host must route `/api` to the backend.
