// Add more staples here. Strict mode doesn't require the user to list these.
const PANTRY_STAPLES = ["water", "oil", "salt", "pepper"];

function scoreRecipe(recipe, ingredients) {
  const recipeText = recipe.ingredients.join(" ").toLowerCase();
  const matched = ingredients.filter((ingredient) => recipeText.includes(ingredient.toLowerCase()));
  const missing = ingredients.filter((ingredient) => !matched.includes(ingredient));

  return {
    ...recipe,
    matchScore: Math.round((matched.length / ingredients.length) * 100),
    matched,
    missing,
  };
}

// Every line of the recipe must be something the user has or a pantry staple.
function isStrictMatch(recipe, ingredients) {
  const allowed = [...ingredients, ...PANTRY_STAPLES].map((item) => item.toLowerCase());
  return recipe.ingredients.every((line) => {
    const lowerLine = line.toLowerCase();
    return allowed.some((item) => lowerLine.includes(item));
  });
}

// temp until LLM
function countTerms(recipe, terms) {
  const recipeText = [recipe.title, recipe.text, ...recipe.ingredients, ...recipe.steps]
    .join(" ")
    .toLowerCase();
  return terms.filter((term) => recipeText.includes(term.toLowerCase())).length;
}

export function rankRecipes(recipes, { ingredients, flavor, foodtype, texture, mode }) {
  const terms = [flavor, foodtype, texture].flat().filter(Boolean);
  const candidates =
    mode === "strict" ? recipes.filter((recipe) => isStrictMatch(recipe, ingredients)) : recipes;

  return candidates
    .map((recipe) => ({ ...scoreRecipe(recipe, ingredients), termCount: countTerms(recipe, terms) }))
    .sort((a, b) => b.matchScore - a.matchScore || b.termCount - a.termCount)
    .map(({ text, termCount, ...recipe }) => recipe);
}
