import { X } from "lucide-react";
import { useCallback, useRef } from "react";
import { t } from "../lib/i18n";
import type { Language, Product, SortMode } from "../lib/types";

interface FilterState {
  searchQuery: string;
  activeCats: string[];
  gender: string;
  color: string;
  size: string;
  minPrice: number;
  maxPrice: number;
  sort: SortMode;
}

interface Props {
  products: Product[];
  lang: Language;
  currency: string;
  onFilterChange: (filters: FilterState) => void;
  filterState: FilterState;
  onFilterStateChange: (fs: FilterState) => void;
}

const MAX_PRICE = 500;

export function FilterBar({
  products,
  lang,
  currency,
  onFilterChange,
  filterState,
  onFilterStateChange,
}: Props) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const update = useCallback(
    (partial: Partial<FilterState>) => {
      const newState = { ...filterState, ...partial };
      onFilterStateChange(newState);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onFilterChange(newState), 120);
    },
    [filterState, onFilterChange, onFilterStateChange],
  );

  const categories = [...new Set(products.map((p) => p.category))];
  const colors = [...new Set(products.map((p) => p.color))];
  const sizes = [...new Set(products.map((p) => p.size))];

  const toggleCat = (cat: string) => {
    const lc = cat.toLowerCase();
    const next = filterState.activeCats.includes(lc)
      ? filterState.activeCats.filter((c) => c !== lc)
      : [...filterState.activeCats, lc];
    update({ activeCats: next });
  };

  const clearAll = () => {
    const reset: FilterState = {
      searchQuery: "",
      activeCats: [],
      gender: "",
      color: "",
      size: "",
      minPrice: 0,
      maxPrice: MAX_PRICE,
      sort: "name-asc",
    };
    onFilterStateChange(reset);
    onFilterChange(reset);
  };

  const minPct = (filterState.minPrice / MAX_PRICE) * 100;
  const maxPct = (filterState.maxPrice / MAX_PRICE) * 100;

  return (
    <div className="bg-card border border-border rounded-2xl p-5 mb-6 space-y-4">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          {t(lang, "category")}
        </p>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => toggleCat(cat)}
              className={`filter-chip px-4 py-1.5 rounded-full text-sm font-medium border ${
                filterState.activeCats.includes(cat.toLowerCase())
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:bg-muted"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            {t(lang, "gender")}
          </p>
          <select
            value={filterState.gender}
            onChange={(e) => update({ gender: e.target.value })}
            className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">{t(lang, "all")}</option>
            <option value="men">{t(lang, "men")}</option>
            <option value="women">{t(lang, "women")}</option>
            <option value="unisex">{t(lang, "unisex")}</option>
            <option value="kids">{t(lang, "kids")}</option>
          </select>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            {t(lang, "color")}
          </p>
          <select
            value={filterState.color}
            onChange={(e) => update({ color: e.target.value })}
            className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Any</option>
            {colors.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            {t(lang, "size")}
          </p>
          <select
            value={filterState.size}
            onChange={(e) => update({ size: e.target.value })}
            className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Any</option>
            {sizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            {t(lang, "sortBy")}
          </p>
          <select
            value={filterState.sort}
            onChange={(e) => update({ sort: e.target.value as SortMode })}
            className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="name-asc">{t(lang, "nameAZ")}</option>
            <option value="name-desc">{t(lang, "nameZA")}</option>
            <option value="price-asc">{t(lang, "priceLH")}</option>
            <option value="price-desc">{t(lang, "priceHL")}</option>
          </select>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
          <span>{t(lang, "priceRange")}</span>
          <span className="font-mono font-semibold">
            {currency}
            {filterState.minPrice} — {currency}
            {filterState.maxPrice}
          </span>
        </div>
        <div className="range-wrap relative h-6">
          <div className="absolute top-[9px] left-0 right-0 h-1.5 bg-border rounded-full">
            <div
              className="absolute h-full bg-primary rounded-full"
              style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={MAX_PRICE}
            step={5}
            value={filterState.minPrice}
            onChange={(e) => {
              const val = Math.min(
                Number(e.target.value),
                filterState.maxPrice - 5,
              );
              update({ minPrice: val });
            }}
            className="absolute w-full"
            aria-label="Minimum price"
          />
          <input
            type="range"
            min={0}
            max={MAX_PRICE}
            step={5}
            value={filterState.maxPrice}
            onChange={(e) => {
              const val = Math.max(
                Number(e.target.value),
                filterState.minPrice + 5,
              );
              update({ maxPrice: val });
            }}
            className="absolute w-full"
            aria-label="Maximum price"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={clearAll}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="w-3.5 h-3.5" />
        {t(lang, "clearAll")}
      </button>
    </div>
  );
}
