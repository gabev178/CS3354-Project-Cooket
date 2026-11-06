# Cooket

Cooket finds recipes using the ingredients you enter. The React frontend sends searches to the Express backend, which searches recipe sites and extracts recipe details.

## Project folders

- `frontend/`: React, TypeScript, Vite, and Tailwind CSS interface.
- `backend/`: Express API and web scraper.
- `docs/`: project documents and scraper documentation.
- `spikes/`: architecture spike artifacts.

## Requirements

- Node.js 22.9 or newer and npm.
- A Tavily API key.
- Playwright Chromium, installed using the command below.

## Run locally

Run all commands from the repository folder, `CS3354-Project-Cooket`. Install dependencies inside `backend` and `frontend`, rather than the repository root.

### Terminal 1: backend

```sh
cd backend
npm install
npx playwright install chromium
```

Create `backend/.env.local` with your own key:

```env
TAVILY_API_KEY=your-key-here
```

Keep this file local and do not commit it. The frontend does not need the key. If both `.env.local` and `.env` exist, values in `.env` take precedence.

Start the backend:

```sh
npm start
```

The backend runs at http://localhost:3000. You can check it at http://localhost:3000/health.

### Terminal 2: frontend

From the repository folder in a second terminal:

```sh
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** and keep both terminals running. Dependency and Chromium installation are only needed during setup or when dependencies change. Press Ctrl+C in each terminal to stop the servers.

## Frontend features

- Comma-separated ingredient input and example ingredient lists.
- Flexible and strict search modes.
- Optional flavor, food type, and texture preferences.
- Recipe results with ingredient match scores, ingredients, instructions, and source links.
- Loading, empty-result, and error messages.
- Responsive cream and green interface.

The Sign up button is a placeholder. Login and registration are not connected yet.

## Frontend build

```sh
cd frontend
npm run build
```

This checks TypeScript and builds the frontend into `frontend/dist/`.

See [frontend instructions](frontend/README.md) for source files and API integration, and [scraper documentation](docs/Scraper.md) for backend setup and the API format.
