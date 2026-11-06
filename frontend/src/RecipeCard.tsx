export interface Recipe {
  title: string;
  url: string;
  ingredients: string[];
  steps: string[];
  matchScore: number;
  matched?: string[];
  missing?: string[];
}

function safeSource(value: string): URL | undefined {
  try {
    const url = new URL(value);

    return ["http:", "https:"].includes(url.protocol) ? url : undefined;

  } catch {
    
    return undefined;
  }
}

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  const source = safeSource(recipe.url);

  return (
    <article className="rounded-[14px] border border-line bg-paper p-6 wrap-anywhere">
      {Number.isFinite(recipe.matchScore) && (
        <span className="inline-block rounded-full bg-[#eaf0df] px-2.5 py-1.5 text-[11px] text-forest">
          {recipe.matchScore}% of your ingredients used
        </span>
      )}

      <h3 className="my-4 font-display text-[25px]">
        {recipe.title || "Untitled recipe"}
      </h3>

      {source && (
        <p className="text-[11px] text-muted">
          {source.hostname.replace(/^www\./, "")}
        </p>
      )}

      {!!recipe.missing?.length && (
        <p className="mt-3 text-[11px] text-muted">
          Not used: {recipe.missing.join(", ")}
        </p>
      )}

      <details className="my-5 text-[13px] leading-relaxed">
        <summary className="text-xs font-semibold">
          Recipe details
        </summary>

        <h4 className="mt-4 mb-2 text-xs font-semibold">Ingredients</h4>
        {recipe.ingredients?.length ? (
          <ul className="list-disc pl-5">
            {recipe.ingredients.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        ) : (
          <p>See original recipe.</p>
        )}

        <h4 className="mt-4 mb-2 text-xs font-semibold">Instructions</h4>
        {recipe.steps?.length ? (
          <ol className="list-decimal pl-5">
            {recipe.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        ) : (
          <p>See original recipe.</p>
        )}
      </details>

      {source && (
        <a
          className="text-xs font-semibold underline underline-offset-4"
          href={source.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          Original recipe ↗
        </a>
      )}
    </article>
  );
}
