// Add more staples here. Strict mode doesn't require the user to list these.
const PANTRY_STAPLES = ["water", "oil", "salt", "pepper"];

// Lowercase, split into words, and make simple plurals singular,
// so "Eggs" -> "egg", "tomatoes" -> "tomato", "berries" -> "berry".
function toWords(text) {
  return text
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter(Boolean)
    .map((word) => {
      if (word.endsWith("ies")) return word.slice(0, -3) + "y";
      if (word.endsWith("oes")) return word.slice(0, -2);
      if (word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
      return word;
    });
}

// True when the phrase's words appear, in order, as whole words in the text.
function hasPhrase(text, phrase) {
  return ` ${toWords(text).join(" ")} `.includes(` ${toWords(phrase).join(" ")} `);
}

function scoreRecipe(recipe, ingredients) {
  const recipeText = recipe.ingredients.join(" ").toLowerCase();
  const matched = ingredients.filter((ingredient) => hasPhrase(recipeText, ingredient));
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
    return allowed.some((item) => hasPhrase(lowerLine, item));
  });
}

// temp until LLM
function countTerms(recipe, terms) {
  const recipeText = [recipe.title, recipe.text, ...recipe.ingredients, ...recipe.steps]
    .join(" ")
    .toLowerCase();
  return terms.filter((term) => hasPhrase(recipeText, term)).length;
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
