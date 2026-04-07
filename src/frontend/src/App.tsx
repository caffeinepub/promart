import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/sonner";
import {
  Loader2,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Shield,
  ShoppingCart,
  Store,
  Sun,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { AdminPanel } from "./components/AdminPanel";
import { CartModal } from "./components/CartModal";
import { FilterBar } from "./components/FilterBar";
import { ProductCard } from "./components/ProductCard";
import { ProductDetailModal } from "./components/ProductDetailModal";
import { useCart } from "./hooks/useCart";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useProducts } from "./hooks/useProducts";
import { applyPrimaryColor } from "./lib/colorUtils";
import { buildSearchIndex, filterAndSort } from "./lib/filterEngine";
import { t } from "./lib/i18n";
import type { Language, Product, ShopSettings, SortMode } from "./lib/types";

type Mode = "shop" | "admin";

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

const DEFAULT_FILTER: FilterState = {
  searchQuery: "",
  activeCats: [],
  gender: "",
  color: "",
  size: "",
  minPrice: 0,
  maxPrice: 500,
  sort: "name-asc",
};

const SETTINGS_KEY = "promart_settings";

function loadSettings(): ShopSettings {
  try {
    const s = localStorage.getItem(SETTINGS_KEY);
    if (s) return JSON.parse(s);
  } catch {
    /* ignore */
  }
  return {
    storeName: "ProMart",
    currency: "$",
    primaryColor: "#FACC15",
    tagline: "Professional • Reliable • Global",
  };
}

function shortenPrincipal(principal: string): string {
  if (principal.length <= 12) return principal;
  return `${principal.slice(0, 5)}…${principal.slice(-4)}`;
}

export default function App() {
  const [mode, setMode] = useState<Mode>("shop");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("promart_theme") === "dark",
  );
  const [lang, setLang] = useState<Language>(
    () => (localStorage.getItem("promart_lang") as Language) || "en",
  );
  const [settings, setSettings] = useState<ShopSettings>(loadSettings);
  const [cartOpen, setCartOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [filterState, setFilterState] = useState<FilterState>(DEFAULT_FILTER);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const filterCacheRef = useRef(new Map<string, Product[]>());

  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const principalText = identity?.getPrincipal().toText();

  const { products, importProducts, updateProduct, deleteProduct } =
    useProducts();
  const {
    cart,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    total,
    count,
  } = useCart();

  const searchIndex = useMemo(() => buildSearchIndex(products), [products]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("promart_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    if (settings.primaryColor) {
      applyPrimaryColor(settings.primaryColor);
    }
  }, [settings.primaryColor]);

  const applyFilters = useCallback(
    (fs: FilterState) => {
      const key = JSON.stringify(fs);
      if (filterCacheRef.current.has(key)) {
        setFilteredProducts(filterCacheRef.current.get(key)!);
        return;
      }
      const result = filterAndSort(products, searchIndex, fs);
      filterCacheRef.current.set(key, result);
      setFilteredProducts(result);
    },
    [products, searchIndex],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional reset on product change
  useEffect(() => {
    filterCacheRef.current.clear();
    applyFilters(DEFAULT_FILTER);
    setFilterState(DEFAULT_FILTER);
  }, [products.length]);

  const handleFilterChange = useCallback(
    (fs: FilterState) => {
      applyFilters(fs);
    },
    [applyFilters],
  );

  const handleLangChange = (l: Language) => {
    setLang(l);
    localStorage.setItem("promart_lang", l);
  };

  const handleSaveSettings = (s: ShopSettings) => {
    setSettings(s);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  };

  const handleCheckout = () => {
    clearCart();
    setCartOpen(false);
    toast.success(t(lang, "orderPlaced"));
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast.success(t(lang, "addedToCart"));
  };

  const handleLogout = () => {
    clear();
    setMode("shop");
    toast.success("Signed out successfully");
  };

  const NavItems = () => (
    <>
      <button
        type="button"
        data-ocid="nav.shop.link"
        onClick={() => {
          setMode("shop");
          setSidebarOpen(false);
        }}
        className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl w-full text-left font-medium transition-colors ${
          mode === "shop"
            ? "bg-primary text-primary-foreground"
            : "hover:bg-muted"
        }`}
      >
        <Store className="w-5 h-5 flex-shrink-0" />
        <span>{t(lang, "shop")}</span>
      </button>
      <button
        type="button"
        data-ocid="nav.admin.link"
        onClick={() => {
          setMode("admin");
          setSidebarOpen(false);
        }}
        className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl w-full text-left font-medium transition-colors ${
          mode === "admin"
            ? "bg-primary text-primary-foreground"
            : "hover:bg-muted"
        }`}
      >
        <Settings className="w-5 h-5 flex-shrink-0" />
        <span>{t(lang, "adminPanel")}</span>
        {!isAuthenticated && (
          <span className="ml-auto">
            <Shield className="w-3.5 h-3.5 text-muted-foreground" />
          </span>
        )}
      </button>
    </>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-6 py-7 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-xl shadow-sm">
            🛒
          </div>
          <div>
            <span className="logo-font text-3xl font-bold text-primary">
              {settings.storeName.replace("Mart", "")}
            </span>
            <span className="logo-font text-3xl font-bold">Mart</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">
          {settings.tagline}
        </p>
      </div>
      <nav className="flex-1 p-3 space-y-1" aria-label="Main navigation">
        <NavItems />
      </nav>
      <div className="p-5 border-t border-border">
        {isInitializing ? (
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        ) : isAuthenticated ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/20 rounded-2xl flex items-center justify-center text-lg shrink-0">
              🔐
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">
                {shortenPrincipal(principalText ?? "")}
              </div>
              <div className="text-xs text-emerald-500">Signed in • Admin</div>
            </div>
            <button
              type="button"
              data-ocid="auth.logout.button"
              onClick={handleLogout}
              title="Sign out"
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            data-ocid="auth.signin.button"
            onClick={login}
            disabled={isLoggingIn}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-2xl hover:bg-muted transition-colors text-left group"
          >
            <div className="w-9 h-9 bg-muted rounded-2xl flex items-center justify-center text-lg shrink-0 group-hover:bg-primary/20 transition-colors">
              {isLoggingIn ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "👤"
              )}
            </div>
            <div>
              <div className="font-semibold text-sm">
                {isLoggingIn ? "Signing in…" : "Sign In"}
              </div>
              <div className="text-xs text-muted-foreground">
                Internet Identity
              </div>
            </div>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <title>{settings.storeName} • Professional Webshop</title>

      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col border-r border-border bg-sidebar fixed h-screen z-40">
          <SidebarContent />
        </aside>

        {/* Mobile sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>

        {/* Main */}
        <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
          <header className="sticky top-0 z-30 bg-card border-b border-border px-4 lg:px-8 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-muted rounded-2xl text-sm font-semibold">
                <span
                  className={`w-2 h-2 rounded-full animate-pulse ${
                    mode === "shop" ? "bg-emerald-400" : "bg-yellow-400"
                  }`}
                />
                {mode === "shop" ? t(lang, "shopMode") : t(lang, "adminMode")}
              </div>

              {mode === "shop" && (
                <div className="relative flex items-center">
                  <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
                  <input
                    type="search"
                    value={filterState.searchQuery}
                    onChange={(e) => {
                      const newFs = {
                        ...filterState,
                        searchQuery: e.target.value,
                      };
                      setFilterState(newFs);
                      handleFilterChange(newFs);
                    }}
                    placeholder={t(lang, "searchPlaceholder")}
                    aria-label="Search products"
                    className="pl-9 pr-4 py-2 bg-muted rounded-2xl border-0 outline-none focus:ring-2 focus:ring-ring text-sm w-44 sm:w-64 lg:w-80 transition-all"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <select
                value={lang}
                onChange={(e) => handleLangChange(e.target.value as Language)}
                className="bg-transparent border border-border rounded-xl px-2 sm:px-3 py-1.5 text-sm focus:outline-none cursor-pointer"
                aria-label="Language"
              >
                <option value="en">🇬🇧 EN</option>
                <option value="es">🇪🇸 ES</option>
                <option value="fr">🇫🇷 FR</option>
                <option value="de">🇩🇪 DE</option>
                <option value="da">🇩🇰 DA</option>
                <option value="uk">🇺🇦 UK</option>
                <option value="ro">🇷🇴 RO</option>
                <option value="it">🇮🇹 IT</option>
                <option value="pl">🇵🇱 PL</option>
              </select>

              <button
                type="button"
                onClick={() => setDarkMode((d) => !d)}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="relative flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
                aria-label={`Cart (${count} items)`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">{t(lang, "cart")}</span>
                {count > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-mono w-5 h-5 flex items-center justify-center rounded-full">
                    {count}
                  </span>
                )}
              </button>

              <div className="w-8 h-8 rounded-xl overflow-hidden border border-border hidden sm:block">
                <img
                  src="https://picsum.photos/id/64/64/64"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </header>

          <main className="flex-1">
            {mode === "shop" && (
              <section className="p-4 lg:p-8">
                <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
                  <div>
                    <h1 className="logo-font text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                      {t(lang, "discoverProducts")}
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                      {t(lang, "subtitle")}
                    </p>
                  </div>
                  <span className="text-xs font-mono bg-muted px-3 py-1.5 rounded-full">
                    {filteredProducts.length} {t(lang, "productsShown")}
                  </span>
                </div>

                <FilterBar
                  products={products}
                  lang={lang}
                  currency={settings.currency}
                  filterState={filterState}
                  onFilterStateChange={setFilterState}
                  onFilterChange={handleFilterChange}
                />

                {filteredProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-4">
                    <span className="text-5xl">🔍</span>
                    <p className="text-lg font-medium">
                      {t(lang, "noProducts")}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredProducts.map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        lang={lang}
                        currency={settings.currency}
                        onAddToCart={handleAddToCart}
                        onCardClick={setDetailProduct}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            {mode === "admin" && (
              <AnimatePresence mode="wait">
                {isAuthenticated ? (
                  <motion.div
                    key="admin-panel"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AdminPanel
                      products={products}
                      lang={lang}
                      currency={settings.currency}
                      settings={settings}
                      onImport={importProducts}
                      onDelete={deleteProduct}
                      onUpdate={updateProduct}
                      onSaveSettings={handleSaveSettings}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="admin-login"
                    data-ocid="auth.dialog"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center justify-center min-h-[calc(100vh-73px)] p-6"
                  >
                    <div className="w-full max-w-sm">
                      <div className="bg-card border border-border rounded-3xl p-8 shadow-xl flex flex-col items-center gap-6">
                        {/* Logo */}
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-2xl shadow-md">
                            🛒
                          </div>
                          <div>
                            <span className="logo-font text-3xl font-bold text-primary">
                              {settings.storeName.replace("Mart", "")}
                            </span>
                            <span className="logo-font text-3xl font-bold">
                              Mart
                            </span>
                          </div>
                        </div>

                        {/* Lock icon */}
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                          <Shield className="w-8 h-8 text-primary" />
                        </div>

                        <div className="text-center space-y-2">
                          <h2 className="text-xl font-bold">
                            Admin Access Required
                          </h2>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            Sign in with Internet Identity to access the admin
                            panel and manage your store.
                          </p>
                        </div>

                        <button
                          type="button"
                          data-ocid="auth.signin.button"
                          onClick={login}
                          disabled={isLoggingIn || isInitializing}
                          className="flex items-center justify-center gap-2.5 w-full bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {isLoggingIn || isInitializing ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              {isInitializing ? "Initializing…" : "Signing in…"}
                            </>
                          ) : (
                            <>
                              <LogIn className="w-4 h-4" />
                              Sign in with Internet Identity
                            </>
                          )}
                        </button>

                        <p className="text-xs text-muted-foreground text-center">
                          Secure, decentralized authentication powered by the
                          Internet Computer.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </main>
        </div>
      </div>

      <CartModal
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        total={total}
        currency={settings.currency}
        lang={lang}
        onUpdateQty={updateQty}
        onRemove={removeFromCart}
        onCheckout={handleCheckout}
      />

      <ProductDetailModal
        product={detailProduct}
        open={!!detailProduct}
        onClose={() => setDetailProduct(null)}
        lang={lang}
        currency={settings.currency}
        onAddToCart={handleAddToCart}
      />

      <Toaster position="bottom-right" richColors />
    </>
  );
}
