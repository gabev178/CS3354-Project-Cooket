# Cooket frontend

The recipe search interface uses React, TypeScript, Vite, and Tailwind CSS v4. It keeps the cream and green theme defined in `src/index.css`.

## Run locally

Start the backend in a separate terminal using the [main setup instructions](../README.md#run-locally). Then, from the repository folder:

```sh
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. Keep the frontend and backend running while searching. The frontend does not need an environment file or API key; the Tavily key stays in `backend/.env.local`.

## Source files

| File | Purpose |
| --- | --- |
| `src/App.tsx` | Header, search form, API requests, and result states. |
| `src/RecipeCard.tsx` | Recipe type and result cards with ingredients, instructions, and source links. |
| `src/main.tsx` | React entry point. |
| `src/index.css` | Tailwind import, theme colors, fonts, and shared styles. |
| `src/vite-env.d.ts` | Vite type declarations, including CSS imports. |
| `vite.config.ts` | React and Tailwind plugins, development port, and API proxy. |

## Search flow

1. Enter ingredients separated by commas or choose an example.
2. Choose Flexible mode to allow extra ingredients, or Strict mode to use the listed ingredients plus water, oil, salt, and pepper.
3. Optionally enter flavor, food type, and texture preferences.
4. Select Search recipes.
5. Expand Recipe details to read ingredients and instructions, or follow the original recipe link.

The page displays loading, no-results, and error messages. The Sign up button is a placeholder for future authentication work.

## Backend connection

The frontend calls `GET /api/webscrape` with `ingredients`, `mode`, and any optional `flavor`, `foodtype`, and `texture` values. It displays the returned `recipes` array. See the [scraper documentation](../docs/Scraper.md) for the response format.

During development, Vite forwards `/api` and `/health` requests to http://localhost:3000. If the backend port changes, update the proxy in `vite.config.ts`.

The match score shows the percentage of the user's ingredients used in a recipe. It does not show whether the user has every ingredient the recipe requires. Preferences currently break ties between recipes with equal scores.

## Commands

Run these inside `frontend/`:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server at http://localhost:5173. |
| `npm run build` | Check TypeScript and create the production files in `dist/`. |
| `npm run preview` | Preview the production build locally after building. |

The preview server only serves the frontend build; it does not use the development API proxy. To search from a production build, configure the host to route `/api` to the backend.

## Checking changes

Run `npm run build`, then check the page in the browser. With the backend running and a valid Tavily key configured, submit a real ingredient search to verify the full integration. Frontend checks using simulated API responses do not verify live scraping.
