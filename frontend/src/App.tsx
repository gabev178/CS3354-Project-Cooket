import { useRef, useState } from "react";
import type { SubmitEvent } from "react";

import RecipeCard from "./RecipeCard";
import type { Recipe } from "./RecipeCard";

type SearchState = "idle" | "loading" | "success" | "error";

const initialMessage = "";

export default function App() {

  const [ingredients, setIngredients] = useState("");

  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const [state, setState] = useState<SearchState>("idle");

  const [message, setMessage] = useState(initialMessage);

  const ingredientInput = useRef<HTMLTextAreaElement>(null);

  const searching = state === "loading";

  async function search(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (searching) return;

    const values = ingredients
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    if (!values.length) {
      ingredientInput.current?.setCustomValidity(
        "Enter at least one ingredient.",
      );

      ingredientInput.current?.reportValidity();
      return;
    }

    const data = new FormData(event.currentTarget);

    const params = new URLSearchParams({
      ingredients: values.join(","),
      mode: String(data.get("mode")),
    });

    for (const key of ["flavor", "foodtype", "texture"]) {
      const value = String(data.get(key) ?? "").trim();

      if (value) params.set(key, value);
    }

    setState("loading");

    setRecipes([]);

    setMessage(
      "Searching recipes…",
    );

    try {
      const response = await fetch(`/api/webscrape?${params}`);

      const payload = await response.json();

      if (!response.ok)
        throw new Error(payload.error || "Search failed. Please try again.");

      if (!Array.isArray(payload.recipes))
        throw new Error("Could not load recipes. Please try again.");

      setRecipes(payload.recipes);

      setState("success");

      setMessage(
        payload.recipes.length
          ? "Check each recipe for extra ingredients."
          : "No recipes found. Try fewer ingredients or Flexible mode.",
      );
    } catch (error) {
      setState("error");

      setMessage(
        error instanceof TypeError
          ? "Cannot connect. Please try again."
          : error instanceof Error
            ? error.message
            : "Search failed. Please try again.",
      );
    }
  }

  return (
    <>
      <header className="flex w-full items-center justify-between px-5 py-6 sm:px-8">
        <a className="brand inline-flex items-center gap-3" href="/">
          <span aria-hidden="true" className="flex size-8.75 shrink-0 items-center justify-center rounded-full bg-forest font-display text-[24px] leading-none tracking-normal text-white">
            <span className="-translate-y-0.5">c.</span>
          </span>

          <span>cooket</span>
        </a>

        <button
          type="button"
          aria-disabled="true"
          title="Sign up coming soon"
          className="rounded-[9px] bg-forest px-5 py-2.5 text-sm font-semibold text-white"
        >
          Sign up
        </button>

      </header>

      <main className="w-full px-5 sm:px-8">
        <section className="pt-10 pb-9 text-center sm:pt-15">
          <h1 className="my-4.5 font-display text-[clamp(44px,6vw,70px)] leading-[1.12] tracking-[-2px]">
            Find <em className="text-[#6a8154]">recipes.</em>
          </h1>

        </section>

        <section
          className="mx-auto max-w-185 rounded-[20px] border border-line bg-paper px-4.5 py-5.5 shadow-[0_8px_40px_#243a2410] sm:p-8"
          aria-labelledby="search-title"
        >
          <form onSubmit={search}>
            <div className="mb-6 flex items-center gap-3">
              <h2 id="search-title" className="font-display text-[26px]">
                Search by ingredients
              </h2>
            </div>

            <label htmlFor="ingredients" className="text-xs font-semibold">
              Ingredients
            </label>

            <textarea
              ref={ingredientInput}
              id="ingredients"
              name="ingredients"
              className="field min-h-21.5 resize-y"
              rows={2}
              required
              maxLength={1000}
              placeholder="e.g. chicken, rice, tomatoes"
              aria-describedby="ingredient-help"
              value={ingredients}
              onChange={(event) => {
                setIngredients(event.target.value);

                event.target.setCustomValidity("");
              }}
            />

            <p id="ingredient-help" className="help">
              Separate ingredients with commas.
            </p>

            <div className="mt-4.5 mb-6 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-[10px] text-muted">
                Examples
              </span>

              {["eggs, spinach, cheese", "pasta, tomatoes, garlic"].map(
                (example) => (
                  <button
                    key={example}
                    type="button"
                    className="rounded-full border border-[#dce2cf] bg-[#f0f3e7] px-2.5 py-2 text-[10px] text-forest"
                    onClick={() => {
                      setIngredients(example);

                      ingredientInput.current?.setCustomValidity("");

                      ingredientInput.current?.focus();
                    }}
                  >
                    {example} ↗
                  </button>
                ),
              )}
            </div>

            <fieldset className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <legend className="mb-3 text-xs font-semibold">
                Search mode
              </legend>

              {[
                {
                  value: "flexible",
                  title: "Flexible",
                  description: "Allow extra ingredients.",
                },
                {
                  value: "strict",
                  title: "Strict",
                  description: "Your ingredients + water, oil, salt and pepper.",
                },
              ].map((mode) => (
                <label
                  key={mode.value}
                  className="flex cursor-pointer items-start gap-2 rounded-[10px] border border-line px-3 py-3.75 has-checked:border-[#8d9f7d] has-checked:bg-sage"
                >
                  <input
                    className="mt-0.5 accent-forest"
                    type="radio"
                    name="mode"
                    value={mode.value}
                    defaultChecked={mode.value === "flexible"}
                  />

                  <span>
                    <strong className="block text-xs">{mode.title}</strong>
                    <small className="mt-1.5 block text-[10px] leading-relaxed text-muted">
                      {mode.description}
                    </small>
                  </span>
                </label>
              ))}
            </fieldset>

            <details className="my-6 border-t border-line pt-4.5">
              <summary className="text-xs">
                Preferences (optional)
              </summary>

              <div className="mt-4.5 grid gap-3 sm:grid-cols-3">
                {[
                  { name: "flavor", title: "Flavor", example: "spicy" },
                  { name: "foodtype", title: "Food type", example: "soup" },
                  { name: "texture", title: "Texture", example: "crispy" },
                ].map((field) => (
                  <label
                    key={field.name}
                    className="text-xs font-semibold"
                    htmlFor={field.name}
                  >
                    {field.title}
                    <input
                      id={field.name}
                      name={field.name}
                      className="field"
                      placeholder={`e.g. ${field.example}`}
                      maxLength={80}
                    />
                  </label>
                ))}
              </div>

            </details>

            <button
              disabled={searching}
              type="submit"
              className="flex w-full justify-between rounded-[9px] bg-forest px-5 py-4.25 text-[13px] font-semibold text-white hover:bg-[#24462f]"
            >
              {searching ? "Searching…" : "Search recipes"}
              <span aria-hidden="true">→</span>
            </button>
          </form>
        </section>

        <section
          className="pt-11 pb-16"
          aria-labelledby="results-title"
          aria-busy={searching}
        >
          <div className="flex items-start justify-between gap-4 sm:items-center">
            <div>
              <h2 id="results-title" className="font-display text-[26px]">
                Recipes
              </h2>
            </div>

            {state === "success" && (
              <span className="text-xs text-muted">
                {recipes.length} recipe{recipes.length === 1 ? "" : "s"} found
              </span>
            )}
          </div>

          <p
            role="status"
            aria-live="polite"
            className={`py-6 text-[13px] leading-relaxed ${state === "error" ? "text-[#9a3a27]" : "text-muted"}`}
          >
            {message}
          </p>

          <div className="grid gap-5 sm:grid-cols-2">
            {recipes.map((recipe, i) => (
              <RecipeCard key={`${recipe.url}-${i}`} recipe={recipe} />
            ))}
          </div>
        </section>
      </main>

    </>
  );
}
