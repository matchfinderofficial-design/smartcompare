import getSupabaseAdmin from "../lib/supabase-admin";

const supabaseAdmin = getSupabaseAdmin();
const DEFAULT_LIMIT = 4;
const GEMINI_MODEL = "gemini-3.6-flash";

type ProductRow = {
  id: number;
  slug: string;
  name: string;
  model?: string | null;
  short_description?: string | null;
  full_description?: string | null;
  key_features?: string[] | null;
  pros?: string[] | null;
  cons?: string[] | null;
  suitable_for?: string[] | null;
  specifications?: Record<string, unknown> | null;
};

type GeneratedContent = {
  short_description: string;
  full_description: string;
  suitable_for: string[];
  key_features: string[];
  pros: string[];
  cons: string[];
};

const responseSchema = {
  type: "object",
  properties: {
    short_description: {
      type: "string",
      description: "A factual British English product summary of 50 to 80 words.",
    },
    full_description: {
      type: "string",
      description: "A factual British English product description of 120 to 220 words.",
    },
    suitable_for: {
      type: "array",
      maxItems: 4,
      items: { type: "string" },
    },
    key_features: {
      type: "array",
      maxItems: 6,
      items: { type: "string" },
    },
    pros: {
      type: "array",
      maxItems: 5,
      items: { type: "string" },
    },
    cons: {
      type: "array",
      maxItems: 4,
      items: { type: "string" },
    },
  },
  required: [
    "short_description",
    "full_description",
    "suitable_for",
    "key_features",
    "pros",
    "cons",
  ]
};

function isPlaceholder(value?: string | null): boolean {
  if (!value) return true;

  return (
    value.startsWith("A concise description of ") ||
    value.startsWith("A longer factual description of ")
  );
}

function arrayNeedsContent(value?: string[] | null): boolean {
  return !Array.isArray(value) || value.length === 0;
}

async function callGeminiForProduct(
  product: ProductRow
): Promise<GeneratedContent> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const factualInput = {
    name: product.name,
    model: product.model ?? null,
    specifications: product.specifications ?? {},
  };

  const prompt = `
Create factual editorial content for a UK product-comparison website.

Use only the supplied product name, model and specifications.
Do not invent facts or imply independent testing.

Rules:
- Use British English.
- Do not include prices.
- Do not include ratings, awards or customer reviews.
- Do not use claims such as "best", "market-leading", "most popular" or "highly rated".
- Do not claim that a feature exists unless it appears in the specifications.
- Pros and cons must be objective consequences of the specifications.
- A missing specification must not be guessed.
- Avoid sales hype and repetitive wording.

Product data:
${JSON.stringify(factualInput, null, 2)}
`;

  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/` +
    `${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Gemini API returned HTTP ${response.status}: ${errorBody.slice(0, 500)}`
    );
  }

  const apiResponse = await response.json();

  const text =
    apiResponse?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text || typeof text !== "string") {
    throw new Error("Gemini returned no usable structured response.");
  }

  const generated = JSON.parse(text) as GeneratedContent;

  if (
    !generated.short_description ||
    !generated.full_description ||
    !Array.isArray(generated.suitable_for) ||
    !Array.isArray(generated.key_features) ||
    !Array.isArray(generated.pros) ||
    !Array.isArray(generated.cons)
  ) {
    throw new Error("Gemini response did not match the required structure.");
  }

  return generated;
}

async function main() {
  const args = process.argv.slice(2);
  const overwrite = args.includes("--overwrite");

  const limitArgument = args.find((argument) =>
    argument.startsWith("--limit=")
  );

  const requestedLimit = limitArgument
    ? Number(limitArgument.split("=")[1])
    : DEFAULT_LIMIT;

  const limit =
    Number.isFinite(requestedLimit) && requestedLimit > 0
      ? Math.min(requestedLimit, 50)
      : DEFAULT_LIMIT;

  const { data: products, error: productError } = await supabaseAdmin
    .from("products")
    .select(
      "id, slug, name, model, short_description, full_description, key_features, pros, cons, suitable_for, specifications"
    )
    .eq("active", true)
    .order("id")
    .limit(limit);

  if (productError) {
    throw new Error(`Could not load products: ${productError.message}`);
  }

  if (!products?.length) {
    console.log("No active products found.");
    return;
  }

  let completed = 0;
  let skipped = 0;
  let failed = 0;

  for (const product of products as ProductRow[]) {
    const needsContent =
      overwrite ||
      isPlaceholder(product.short_description) ||
      isPlaceholder(product.full_description) ||
      arrayNeedsContent(product.key_features) ||
      arrayNeedsContent(product.pros) ||
      arrayNeedsContent(product.cons) ||
      arrayNeedsContent(product.suitable_for);

    if (!needsContent) {
      skipped++;
      continue;
    }

    try {
      console.log(`Generating content for ${product.slug}`);

      await supabaseAdmin
        .from("products")
        .update({
          automation_status: "processing",
          automation_error: null,
          last_automated_at: new Date().toISOString(),
        })
        .eq("id", product.id);

      const generated = await callGeminiForProduct(product);

      const updatePayload = {
        short_description:
          overwrite || isPlaceholder(product.short_description)
            ? generated.short_description
            : product.short_description,

        full_description:
          overwrite || isPlaceholder(product.full_description)
            ? generated.full_description
            : product.full_description,

        key_features:
          overwrite || arrayNeedsContent(product.key_features)
            ? generated.key_features
            : product.key_features,

        suitable_for:
          overwrite || arrayNeedsContent(product.suitable_for)
            ? generated.suitable_for
            : product.suitable_for,

        pros:
          overwrite || arrayNeedsContent(product.pros)
            ? generated.pros
            : product.pros,

        cons:
          overwrite || arrayNeedsContent(product.cons)
            ? generated.cons
            : product.cons,

        content_generated_at: new Date().toISOString(),
        last_automated_at: new Date().toISOString(),
        automation_status: "completed",
        automation_error: null,
      };

      const { error: updateError } = await supabaseAdmin
        .from("products")
        .update(updatePayload)
        .eq("id", product.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      completed++;

      // Small delay to reduce API-rate pressure.
      await new Promise((resolve) => setTimeout(resolve, 15000));
    } catch (error) {
      failed++;

      const message =
        error instanceof Error ? error.message : String(error);

      console.error(`Generation failed for ${product.slug}: ${message}`);

      await supabaseAdmin
        .from("products")
        .update({
          automation_status: "failed",
          automation_error: message.slice(0, 1000),
          last_automated_at: new Date().toISOString(),
        })
        .eq("id", product.id);
    }
  }

  console.log(
    `Generation finished: ${completed} completed, ${skipped} skipped, ${failed} failed.`
  );

  if (failed > 0 && completed === 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(
    "Fatal generation error:",
    error instanceof Error ? error.message : error
  );
  process.exitCode = 1;
});
