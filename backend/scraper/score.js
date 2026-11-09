// Add more staples here. Strict mode doesn't require the user to list these.
const PANTRY_STAPLES = ["water", "oil", "salt", "pepper"];

// Plurals that the rules in singularForms can't work out.
// If you discover more, please add them here.
const IRREGULAR = new Map([
  ["leaves", "leaf"],
  ["loaves", "loaf"],
  ["halves", "half"],
  ["knives", "knife"],
  ["teeth", "tooth"],
  ["geese", "goose"],
  ["mice", "mouse"],
]);

// Lowercase and removes accents ("jalapeño" -> "jalapeno")
function toWords(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split(/[^a-z]+/)
    .filter(Boolean);
}

// Every form the word could have as a singular, including itself.
// "peaches" -> peaches, peache, peach. "berries" -> berries, berrie, berry.
// Words ending in "ss" (glass, bass) are already singular.
function singularForms(word) {
  const forms = new Set([word]);
  if (IRREGULAR.has(word)) forms.add(IRREGULAR.get(word));
  if (word.endsWith("s") && !word.endsWith("ss")) {
    forms.add(word.slice(0, -1)); // eggs -> egg, quiches -> quiche
    if (word.endsWith("es")) forms.add(word.slice(0, -2)); // peaches -> peach, tomatoes -> tomato
    if (word.endsWith("ies")) forms.add(word.slice(0, -3) + "y"); // berries -> berry
  }
  return forms;
}

// Two words match when they are equal or share a singular form,
// so "egg" matches "eggs" but not "eggplant".
function sameWord(a, b) {
  if (a === b) return true;
  const formsOfB = singularForms(b);
  return [...singularForms(a)].some((form) => formsOfB.has(form));
}

// True when every word of the phrase appears, in order, as whole words in the text.
// "baking powder" matches "3 tsp baking powder" but not "baking soda".
function hasPhrase(text, phrase) {
  const textWords = toWords(text);
  const phraseWords = toWords(phrase);
  if (phraseWords.length === 0) return false;

  for (let start = 0; start + phraseWords.length <= textWords.length; start++) {
    if (phraseWords.every((word, i) => sameWord(textWords[start + i], word))) return true;
  }
  return false;
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
