import type { Product } from "../types";

const fallbackImage = "/favicon.svg";

const productFiles = import.meta.glob("../../RAVEN PERFUME DATA/**/*.txt", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

type ParsedText = {
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: Product["category"];
  gender: Product["gender"];
  scentFamily: string;
  concentration: string;
  sillage: Product["sillage"];
  longevity: string;
  tags: string[];
  notes: Product["notes"];
  isFeatured: boolean;
  isBestseller: boolean;
  isNew: boolean;
  variant: Product["variants"][number];
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function clean(value: string) {
  return value.replace(/\r/g, "").trim();
}

function extractAfter(label: string, text: string) {
  const index = text.indexOf(label);
  if (index < 0) return "";
  return clean(text.slice(index + label.length));
}

function extractBlock(label: string, text: string, nextLabels: string[]) {
  const start = text.indexOf(label);
  if (start < 0) return "";
  const rest = text.slice(start + label.length);
  let end = rest.length;
  for (const next of nextLabels) {
    const idx = rest.indexOf(next);
    if (idx >= 0 && idx < end) end = idx;
  }
  return clean(rest.slice(0, end));
}

function matchValue(patterns: RegExp[], text: string) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return clean(match[1]);
  }
  return "";
}

function splitList(value: string) {
  return value
    .replace(/[•·]/g, "\n")
    .split(/\n|,/)
    .map((part) => part.replace(/^[-\s]+|[-\s]+$/g, "").trim())
    .filter(Boolean)
    .filter((part) => !/^\w+:?$/.test(part))
    .slice(0, 12);
}

function parseNotes(text: string): Product["notes"] {
  const top = matchValue(
    [
      /Top Notes[^:\n]*[:\-]?\s*([\s\S]*?)(?:\n\s*Middle Notes|\n\s*Base Notes|$)/i,
      /Top\s*:\s*([\s\S]*?)(?:\n\s*Middle|\n\s*Base|$)/i,
    ],
    text,
  );
  const middle = matchValue(
    [
      /Middle Notes[^:\n]*[:\-]?\s*([\s\S]*?)(?:\n\s*Base Notes|$)/i,
      /Heart\s*:\s*([\s\S]*?)(?:\n\s*Base|$)/i,
    ],
    text,
  );
  const base = matchValue(
    [/Base Notes[^:\n]*[:\-]?\s*([\s\S]*?)$/i, /Base\s*:\s*([\s\S]*?)$/i],
    text,
  );

  return {
    top: splitList(top),
    middle: splitList(middle),
    base: splitList(base),
  };
}

function inferCategory(
  name: string,
  concentration: string,
  folder: string,
): Product["category"] {
  const combined = `${name} ${concentration} ${folder}`.toLowerCase();
  if (combined.includes("solid")) return "Solid Perfume";
  if (combined.includes("eau de toilette") || combined.includes("edt"))
    return "eau-de-toilette";
  if (
    combined.includes("eau de parfum") ||
    combined.includes("edp") ||
    combined.includes("elixir")
  ) {
    return "eau-de-parfum";
  }
  return "parfum";
}

function inferSillage(value: string): Product["sillage"] {
  const lower = value.toLowerCase();
  if (lower.includes("heavy")) return "heavy";
  if (lower.includes("light")) return "light";
  return "moderate";
}

function parseProduct(text: string, sourcePath: string): Product {
  const folder = sourcePath.split(/[\\/]/).slice(-2, -1)[0] ?? "Raven";
  const rawName = matchValue([/Name\s*-\s*([^\n]+)/i], text) || folder;
  const name = rawName
    .replace(/^RAVEN(?:™)?\s*[–-]\s*/i, "")
    .replace(/^RAVEN\s*/i, "")
    .trim();

  const description = extractBlock("Description -", text, [
    "Price  -",
    "Price -",
    "Price-",
    "Category -",
  ]);
  const priceRaw = matchValue([/Price\s*-\s*([0-9,]+)/i], text) || "499";
  const compareAtRaw = matchValue([/MRP-\s*([0-9,]+)/i], text);
  const categoryText = matchValue([/Category\s*-\s*([^\n]+)/i], text);
  const scentFamily = extractBlock("Scent family-Primary Scent Family", text, [
    "Concentration",
    "Sillage",
    "Longevity",
    "Main perfume tags",
    "Notes-",
  ])
    .split(/\n/)[0]
    .replace(/^Primary Scent Family/i, "")
    .trim();
  const concentration =
    matchValue([/Concentration\s*-\s*([^\n]+)/i], text) || "Eau de Parfum";
  const sillage = inferSillage(
    matchValue([/Sillage\s*-\s*([^\n]+)/i], text) || "Moderate",
  );
  const longevity =
    matchValue([/Longevity\s*-\s*([^\n]+)/i], text) || "Long-lasting";
  const tagsBlock = extractBlock("Main perfume tags-", text, ["Notes-"]);
  const notesBlock = extractAfter("Notes-", text);
  const price = Number(priceRaw.replace(/,/g, "")) || 499;
  const compareAtPrice = Number(compareAtRaw?.replace(/,/g, "")) || undefined;
  const slug = slugify(name || folder);
  const isSolid = /solid/i.test(`${folder} ${name} ${concentration}`);
  const variantSize = isSolid ? 10 : 50;
  const variantUnit = isSolid ? "g" : "ml";
  const inferredTags = splitList(tagsBlock);

  return {
    id: slug,
    name,
    brand: "Raven",
    slug,
    shortDescription:
      description.split(/\n\n/)[0]?.trim() || description.slice(0, 160),
    description,
    price,
    compareAtPrice,
    images: [fallbackImage],
    category: inferCategory(name, concentration, folder),
    gender: "unisex",
    scentFamily: scentFamily || "Signature",
    tags: inferredTags.length ? inferredTags : [folder],
    notes: parseNotes(notesBlock),
    concentration,
    sillage,
    longevity,
    variants: [
      {
        size: variantSize,
        unit: variantUnit,
        price,
        stock: 24,
        sku: `${slug}-${variantSize}${variantUnit}`,
      },
    ],
    rating: 4.7,
    reviewCount: 18,
    isFeatured: /amber cherry|dark ocean|luxuria|bad boy|signature/i.test(
      folder,
    ),
    isBestseller: /dark ocean|luxuria|amber cherry|iconic|saffron musk/i.test(
      folder,
    ),
    isNew: /gold|solid|signature/i.test(folder),
  };
}

export const localProducts = Object.entries(productFiles)
  .map(([sourcePath, text]) => parseProduct(text, sourcePath))
  .sort(
    (a, b) =>
      Number(b.isFeatured) - Number(a.isFeatured) ||
      a.name.localeCompare(b.name),
  );

export function filterLocalProducts(filters: {
  search?: string;
  gender?: string;
  scent_family?: string;
  max_price?: number;
  is_new?: boolean;
  is_bestseller?: boolean;
  sort?: string;
}) {
  let products = [...localProducts];

  if (filters.search) {
    const query = filters.search.toLowerCase();
    products = products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.scentFamily.toLowerCase().includes(query) ||
        product.tags.some((tag) => tag.toLowerCase().includes(query)),
    );
  }

  if (filters.gender)
    products = products.filter((product) => product.gender === filters.gender);
  if (filters.scent_family)
    products = products.filter(
      (product) => product.scentFamily === filters.scent_family,
    );
  if (filters.max_price)
    products = products.filter(
      (product) => product.price <= filters.max_price!,
    );
  if (filters.is_new) products = products.filter((product) => product.isNew);
  if (filters.is_bestseller)
    products = products.filter((product) => product.isBestseller);

  switch (filters.sort) {
    case "price_asc":
      products.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      products.sort((a, b) => b.price - a.price);
      break;
    case "newest":
      products.sort((a, b) => Number(b.isNew) - Number(a.isNew));
      break;
    case "rating":
      products.sort((a, b) => b.rating - a.rating);
      break;
    default:
      products.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
      break;
  }

  return products;
}
