import { chromium } from "playwright";
import { buildQuery, searchRecipes } from "./search.js";
import { extractRecipe } from "./extract.js";

export async function scrapeRecipes({ ingredients }) {
  const urls = await searchRecipes(buildQuery(ingredients));

  const browser = await chromium.launch();
  try {
    const pages = await Promise.all(urls.map((url) => extractRecipe(browser, url)));
    // TEMP, scoring and ranking are added in Part 4.
    return pages.filter(Boolean).map(({ text, ...recipe }) => recipe);
  } finally {
    await browser.close();
  }
}
