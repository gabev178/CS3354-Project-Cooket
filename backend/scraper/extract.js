const PAGE_TIMEOUT_MS = 15000;
const BLOCKED_RESOURCES = ["image", "font", "stylesheet", "media"];

function isRecipe(node) {
  return [node["@type"]].flat().includes("Recipe");
}

// JSON-LD can be a single object, an array, or nested under @graph.
function findRecipe(data) {
  if (!data || typeof data !== "object") return null;
  if (Array.isArray(data)) {
    for (const item of data) {
      const recipe = findRecipe(item);
      if (recipe) return recipe;
    }
    return null;
  }
  return isRecipe(data) ? data : findRecipe(data["@graph"]);
}

// Instructions can be a string, HowToStep objects, or HowToSections of steps.
function toSteps(instructions) {
  if (!instructions) return [];
  if (typeof instructions === "string") return [instructions];
  if (Array.isArray(instructions)) return instructions.flatMap(toSteps);
  if (instructions.itemListElement) return toSteps(instructions.itemListElement);
  return toSteps(instructions.text ?? instructions.name);
}

function cleanList(items) {
  return items.map((item) => item.replace(/\s+/g, " ").trim()).filter(Boolean);
}

async function fromJsonLd(page) {
  const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();

  for (const script of scripts) {
    let data;
    try {
      data = JSON.parse(script);
    } catch {
      continue; // Sites sometimes publish invalid JSON-LD.
    }

    const recipe = findRecipe(data);
    if (recipe) {
      return {
        title: recipe.name,
        ingredients: cleanList([recipe.recipeIngredient ?? []].flat()),
        steps: cleanList(toSteps(recipe.recipeInstructions)),
        // Used for ranking only, not returned to the client.
        text: [recipe.description, recipe.keywords, recipe.recipeCategory, recipe.recipeCuisine]
          .flat()
          .filter(Boolean)
          .join(" "),
      };
    }
  }
  return null;
}

async function fromDom(page) {
  return page.evaluate(() => {
    const textOf = (elements) =>
      [...elements].map((element) => element.textContent.replace(/\s+/g, " ").trim());

    const ingredients = document.querySelectorAll(
      '[class*="ingredient" i] li, [id*="ingredient" i] li, li[class*="ingredient" i]',
    );
    // The longest ordered list is the most likely to be the steps, not a breadcrumb.
    const lists = [...document.querySelectorAll("ol")].map((list) => list.querySelectorAll("li"));
    const steps = lists.reduce((longest, list) => (list.length > longest.length ? list : longest), []);

    return {
      title: document.querySelector("h1")?.textContent.trim() ?? document.title,
      ingredients: [...new Set(textOf(ingredients))].filter(Boolean),
      steps: textOf(steps).filter(Boolean),
      text: document.querySelector('meta[name="description"]')?.content ?? "",
    };
  });
}

// Returns null for pages that fail or have no recipe, so one bad page can't fail the request.
export async function extractRecipe(browser, url) {
  const page = await browser.newPage();
  try {
    await page.route("**/*", (route) =>
      BLOCKED_RESOURCES.includes(route.request().resourceType()) ? route.abort() : route.continue(),
    );
    const response = await page.goto(url, { timeout: PAGE_TIMEOUT_MS, waitUntil: "domcontentloaded" });
    if (response && !response.ok()) {
      console.log(`Skipped, status ${response.status()}: ${url}`);
      return null;
    }

    const recipe = (await fromJsonLd(page)) ?? (await fromDom(page));
    if (recipe.ingredients.length === 0) {
      console.log(`Skipped, no recipe found: ${url}`);
      return null;
    }
    return { ...recipe, url };
  } catch (error) {
    console.log(`Skipped, page failed: ${url} (${error.message.split("\n")[0]})`);
    return null;
  } finally {
    await page.close();
  }
}
