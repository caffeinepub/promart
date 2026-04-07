import type { Product, SortMode } from "./types";

export interface SearchFilters {
  text: string;
  priceMin: number | null;
  priceMax: number | null;
  category: string | null;
  color: string | null;
  gender: string | null;
  size: string | null;
}

export function parseAdvancedSearch(query: string): SearchFilters {
  const result: SearchFilters = {
    text: "",
    priceMin: null,
    priceMax: null,
    category: null,
    color: null,
    gender: null,
    size: null,
  };
  if (!query.trim()) return result;

  const terms = query.toLowerCase().trim().split(/\s+/);
  const textParts: string[] = [];

  for (const term of terms) {
    if (term.includes("price>"))
      result.priceMin = Number.parseFloat(term.split(">")[1]) || null;
    else if (term.includes("price<"))
      result.priceMax = Number.parseFloat(term.split("<")[1]) || null;
    else if (term.startsWith("category:")) result.category = term.split(":")[1];
    else if (term.startsWith("color:")) result.color = term.split(":")[1];
    else if (term.startsWith("gender:")) result.gender = term.split(":")[1];
    else if (term.startsWith("size:")) result.size = term.split(":")[1];
    else textParts.push(term);
  }

  result.text = textParts.join(" ");
  return result;
}

export function buildSearchIndex(products: Product[]) {
  return products.map((p) => ({
    id: p.id,
    searchable:
      `${p.name} ${p.description} ${p.category} ${p.color} ${p.gender} ${p.size}`.toLowerCase(),
  }));
}

export function filterAndSort(
  products: Product[],
  searchIndex: { id: string; searchable: string }[],
  opts: {
    searchQuery: string;
    activeCats: string[];
    gender: string;
    color: string;
    size: string;
    minPrice: number;
    maxPrice: number;
    sort: SortMode;
  },
): Product[] {
  const parsed = parseAdvancedSearch(opts.searchQuery);

  let filtered = products.filter((p) => {
    const catMatch =
      opts.activeCats.length === 0 ||
      opts.activeCats.includes(p.category.toLowerCase());
    const genderMatch = !opts.gender || p.gender === opts.gender;
    const colorMatch =
      !opts.color || p.color.toLowerCase() === opts.color.toLowerCase();
    const sizeMatch =
      !opts.size || p.size.toLowerCase() === opts.size.toLowerCase();
    const priceMatch = p.price >= opts.minPrice && p.price <= opts.maxPrice;

    if (parsed.category && !p.category.toLowerCase().includes(parsed.category))
      return false;
    if (parsed.color && !p.color.toLowerCase().includes(parsed.color))
      return false;
    if (parsed.gender && p.gender !== parsed.gender) return false;
    if (parsed.size && !p.size.toLowerCase().includes(parsed.size))
      return false;
    if (parsed.priceMin !== null && p.price <= parsed.priceMin) return false;
    if (parsed.priceMax !== null && p.price >= parsed.priceMax) return false;

    const textMatch =
      !parsed.text ||
      (searchIndex
        .find((i) => i.id === p.id)
        ?.searchable.includes(parsed.text) ??
        false);

    return (
      catMatch &&
      genderMatch &&
      colorMatch &&
      sizeMatch &&
      priceMatch &&
      textMatch
    );
  });

  if (opts.sort === "name-asc")
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  else if (opts.sort === "name-desc")
    filtered.sort((a, b) => b.name.localeCompare(a.name));
  else if (opts.sort === "price-asc")
    filtered.sort((a, b) => a.price - b.price);
  else if (opts.sort === "price-desc")
    filtered.sort((a, b) => b.price - a.price);

  return filtered;
}
