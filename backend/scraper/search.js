const SEARCH_URL = "https://api.tavily.com/search";
const MAX_RESULTS = 10;

// temp until LLM
export function buildQuery(ingredients) {
  return `${ingredients.join(" ")} recipe`;
}

export async function searchRecipes(query) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    throw new Error("TAVILY_API_KEY is not set, add it to backend/.env");
  }

  const response = await fetch(SEARCH_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, max_results: MAX_RESULTS }),
  });

  if (!response.ok) {
    throw new Error(`Tavily search failed with status ${response.status}`);
  }

  const { results } = await response.json();
  return results.map((result) => result.url);
}
