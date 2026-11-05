import { chromium } from "playwright";
import { buildQuery, searchRecipes } from "./search.js";
import { extractRecipe } from "./extract.js";
import { rankRecipes } from "./score.js";

export async function scrapeRecipes(params) {
  const urls = await searchRecipes(buildQuery(params.ingredients));

  const browser = await chromium.launch();
  try {
    const pages = await Promise.all(urls.map((url) => extractRecipe(browser, url)));
    return rankRecipes(pages.filter(Boolean), params);
  } finally {
    await browser.close();
  }
}
