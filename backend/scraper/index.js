import { buildQuery, searchRecipes } from "./search.js";

// TEMP, returns result URLs until extraction is added in Part 3.
export async function scrapeRecipes({ ingredients }) {
  return searchRecipes(buildQuery(ingredients));
}
