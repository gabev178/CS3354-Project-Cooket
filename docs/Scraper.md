# Webscraper Docs

## Setup

Need a Tavily API key (free at tavily.com) since that's what does the searching. Put it in backend/.env or backend/.env.local, if both exist .env is used. Each person needs their own, and don't commit it.

```
TAVILY_API_KEY=your-key-here
```

Then in backend run these, the second one downloads Chromium for Playwright so it's a big download.

```
npm install
npx playwright install chromium
npm start
```

Make sure to use npm start, node server.js alone won't load the key. Node needs to be 22.9 or newer.

## API format

```
api/webscrape?ingredients=[ingredients]&flavor=[flavor(optional)]&foodtype=[foodtype(optional)]&texture=[texture(optional)]&mode=[mode(optional)]
```

replace [] with actual inputs, ingredients are comma separated. mode is either flexible or strict, defaults to flexible.

Example: api/webscrape?ingredients=bread,peanut butter,jelly&flavor=sweet&mode=strict

## Response format

```json
{
  "count": 1,
  "recipes": [
    {
      "title": "Classic PB&J",
      "url": "https://example.com/pbj",
      "ingredients": ["2 slices bread", "2 tbsp peanut butter"],
      "steps": ["Spread...", "Close..."],
      "matchScore": 67,
      "matched": ["bread", "peanut butter"],
      "missing": ["jelly"]
    }
  ]
}
```

matchScore is the percentage of the user's ingredients found in the recipe. missing is the user's ingredients the recipe doesn't use, not extra stuff the recipe needs.

Errors come back as { "error": "..." }

- 400 if ingredients is missing/empty or mode isn't valid
- 502 if the search fails, the server console will say why
- No recipes found isn't an error, it's a 200 with count 0 and an empty recipes list

## Functionality

The webscraper searches for relevant recipes based on the ingredients via keyword searching. LLM aided search queries to find recipes the user would want.

After inital scraping the results get scored on ingredients then ranked. The search is only by ingredients and the optional params are post processing for the subjective parts of the recipe. For now flavor, foodtype, and texture just break ties between recipes with the same matchScore, they never remove a recipe or change the score. This is temp until the LLM.

## Implementation Plans and Architecture

Use node.js backend for both express(ease of use) and Playwright access to do the webscraping. Frontend can be planned later as node.js can be used with most frontends without issues.

We use the Tavily search API to find recipe URLs, we originally planned to use Playwright for this on google then duckduckgo HTML, but duckduckgo gave a 403 to the headless browser. Then using PlayWright we create a headless browser to scrape the HTML of each result. To ease the RAM usage we block images, fonts, stylesheets, and media.

If there are json results(schema.org Recipe JSON-LD), use those instead of the DOM, DOM searching is a fallback, not inital choice. The fallback takes ingredients from li elements inside anything with class or id containing "ingredient", since most recipes are programmically made rather than hand coded. Takes steps from the longest ol html element, since most are an order list.

Code is in backend/scraper

- search.js: builds the query and calls Tavily
- extract.js: gets the recipe out of a page
- score.js: scoring, strict mode, and ranking

## Current limitations:

- Matching is too loose: it looks for the text anywhere inside a line, so egg matches eggplant. Strict mode also lets unsalted butter through, because it contains salt, and foil should pass the same way because it contains oil. This could hurt QR-03's 90% target, along with plurals like tomatoes vs tomato. The LLM or a normalization step could fix both later.
- missing can look odd: a "swirl bread" recipe lists bread as missing, because it makes bread from flour. That's accurate, since it only checks the ingredient list.
- matchScore ignores extra ingredients: a recipe that uses all your ingredients scores 100 even if it needs 10 more. This follows the proposal's Q3 assumption, so flexible mode can rank a recipe high even when you're missing a lot for it.
- Lots of results get skipped: many recipe blogs block us with Cloudflare(403), and youtube/facebook links have no recipe data. Only 3-4 of the 10 results came back in testing. Skipped pages are logged in the server console. We could raise MAX_RESULTS in search.js to 20 if results are too thin.
- Slow compared to QR-01: it scrapes live on every search with no time limit, one test took about 6 seconds and the 3 second target isn't met yet. Database work should help with this later.
