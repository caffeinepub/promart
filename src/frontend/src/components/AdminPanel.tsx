import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Download, Edit2, Save, Trash2, Upload, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { applyPrimaryColor } from "../lib/colorUtils";
import { i18n, t } from "../lib/i18n";
import type { Language, Product, ShopSettings } from "../lib/types";

interface Props {
  products: Product[];
  lang: Language;
  currency: string;
  settings: ShopSettings;
  onImport: (products: Product[]) => void;
  onDelete: (id: string) => void;
  onUpdate: (p: Product) => void;
  onSaveSettings: (s: ShopSettings) => void;
}

function parseCSV(text: string): Partial<Product>[] {
  const lines = text.trim().split("\n");
  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().toLowerCase().replace(/"/g, ""));
  return lines.slice(1).map((line) => {
    const values = line.match(/(?:"([^"]*(?:""[^"]*)*)")|([^,]+)|(?=,)/g) || [];
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = (values[i] || "")
        .replace(/^"|"$/g, "")
        .replace(/""/g, '"')
        .trim();
    });
    return {
      id: Math.random().toString(36).slice(2),
      name: obj.name || "",
      description: obj.description || "",
      price: Number.parseFloat(obj.price) || 0,
      category: obj.category || "General",
      gender: obj.gender || "unisex",
      color: obj.color || "N/A",
      size: obj.size || "One Size",
      imageUrl:
        obj.imageurl ||
        obj.image ||
        `https://picsum.photos/seed/${Math.random().toString(36).slice(2)}/400/400`,
      stock: Number.parseInt(obj.stock) || 10,
      rating: 4.0,
      reviews: 0,
    };
  });
}

function exportToCSV(products: Product[]) {
  const headers =
    "Name,Description,Price,Category,Gender,Color,Size,ImageUrl,Stock";
  const rows = products.map(
    (p) =>
      `"${p.name.replace(/"/g, '""')}","${p.description.replace(/"/g, '""')}",${p.price},"${p.category}","${p.gender}","${p.color}","${p.size}","${p.imageUrl}",${p.stock}`,
  );
  const csv = [headers, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `promart_catalog_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
}

const LANG_LABELS: Record<Language, string> = {
  en: "🇬🇧 English",
  es: "🇪🇸 Español",
  fr: "🇫🇷 Français",
  de: "🇩🇪 Deutsch",
  da: "🇩🇰 Dansk",
  uk: "🇺🇦 Українська",
  ro: "🇷🇴 Română",
  it: "🇮🇹 Italiano",
  pl: "🇵🇱 Polski",
};

export function AdminPanel({
  products,
  lang,
  currency,
  settings,
  onImport,
  onDelete,
  onUpdate,
  onSaveSettings,
}: Props) {
  const [csvPreview, setCsvPreview] = useState<Partial<Product>[]>([]);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [localSettings, setLocalSettings] = useState(settings);
  const allLangs = Object.keys(i18n) as Language[];
  const [translations, setTranslations] = useState<Record<Language, string>>(
    Object.fromEntries(
      allLangs.map((l) => [l, JSON.stringify(i18n[l], null, 2)]),
    ) as Record<Language, string>,
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCSV(text);
      setCsvPreview(parsed);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    const validProducts = csvPreview.filter(
      (p) => p.name && p.price,
    ) as Product[];
    onImport(validProducts);
    setCsvPreview([]);
    toast.success(`${validProducts.length} ${t(lang, "importSuccess")}`);
  };

  const handleExport = () => {
    if (!products.length) {
      toast.error("No products to export");
      return;
    }
    exportToCSV(products);
    toast.success(`Exported ${products.length} products`);
  };

  const handleDeleteProduct = (id: string) => {
    onDelete(id);
    toast.success(t(lang, "productDeleted"));
  };

  const handleSaveEdit = () => {
    if (editProduct) {
      onUpdate(editProduct);
      setEditProduct(null);
      toast.success("Product updated");
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <Tabs defaultValue="import">
        <TabsList className="mb-6 rounded-2xl bg-muted p-1 flex-wrap h-auto gap-1">
          <TabsTrigger value="import" className="rounded-xl">
            {t(lang, "importCSV")}
          </TabsTrigger>
          <TabsTrigger value="manage" className="rounded-xl">
            {t(lang, "manageProducts")}
          </TabsTrigger>
          <TabsTrigger value="translations" className="rounded-xl">
            {t(lang, "translationTool")}
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-xl">
            {t(lang, "themes")}
          </TabsTrigger>
        </TabsList>

        {/* Import Tab */}
        <TabsContent value="import">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold mb-2">{t(lang, "importCSV")}</h2>
            <p className="text-muted-foreground text-sm mb-6">
              CSV format: Name, Description, Price, Category, Gender, Color,
              Size, ImageUrl, Stock
            </p>
            <label
              htmlFor="csv-upload"
              className="border-2 border-dashed border-border rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <Upload className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="font-semibold">Click to upload CSV file</p>
              <p className="text-sm text-muted-foreground mt-1">
                or drag and drop
              </p>
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>

            {csvPreview.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold">
                    {csvPreview.length} rows parsed
                  </p>
                  <Button
                    onClick={handleImport}
                    className="bg-primary text-primary-foreground rounded-xl"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Import {csvPreview.length} products
                  </Button>
                </div>
                <div className="border border-border rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        {[
                          "Name",
                          "Price",
                          "Category",
                          "Gender",
                          "Color",
                          "Size",
                        ].map((h) => (
                          <th
                            key={h}
                            className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview.slice(0, 20).map((row, i) => (
                        <tr
                          // biome-ignore lint/suspicious/noArrayIndexKey: static preview
                          key={i}
                          className={`border-t border-border hover:bg-muted/50 ${
                            !row.name || !row.price ? "bg-destructive/10" : ""
                          }`}
                        >
                          <td className="px-4 py-2.5">
                            {row.name || (
                              <span className="text-destructive">Missing</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5">
                            {row.price ? (
                              `${currency}${row.price}`
                            ) : (
                              <span className="text-destructive">Missing</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5">{row.category}</td>
                          <td className="px-4 py-2.5">{row.gender}</td>
                          <td className="px-4 py-2.5">{row.color}</td>
                          <td className="px-4 py-2.5">{row.size}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Manage Products Tab */}
        <TabsContent value="manage">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {t(lang, "allProducts")} •{" "}
              <span className="text-primary">{products.length}</span>
            </h2>
            <Button
              onClick={handleExport}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
            >
              <Download className="w-4 h-4 mr-2" />
              {t(lang, "exportCSV")}
            </Button>
          </div>

          {editProduct && (
            <div className="bg-muted rounded-2xl p-5 mb-6 border border-border">
              <h3 className="font-semibold mb-4">
                {t(lang, "edit")}: {editProduct.name}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="edit-name"
                    className="text-xs text-muted-foreground uppercase tracking-wider"
                  >
                    Name
                  </label>
                  <Input
                    id="edit-name"
                    value={editProduct.name}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, name: e.target.value })
                    }
                    className="mt-1 rounded-xl"
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-price"
                    className="text-xs text-muted-foreground uppercase tracking-wider"
                  >
                    Price
                  </label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={editProduct.price}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        price: Number(e.target.value),
                      })
                    }
                    className="mt-1 rounded-xl"
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-category"
                    className="text-xs text-muted-foreground uppercase tracking-wider"
                  >
                    Category
                  </label>
                  <Input
                    id="edit-category"
                    value={editProduct.category}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        category: e.target.value,
                      })
                    }
                    className="mt-1 rounded-xl"
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-stock"
                    className="text-xs text-muted-foreground uppercase tracking-wider"
                  >
                    Stock
                  </label>
                  <Input
                    id="edit-stock"
                    type="number"
                    value={editProduct.stock}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        stock: Number(e.target.value),
                      })
                    }
                    className="mt-1 rounded-xl"
                  />
                </div>
                <div className="col-span-2">
                  <label
                    htmlFor="edit-desc"
                    className="text-xs text-muted-foreground uppercase tracking-wider"
                  >
                    Description
                  </label>
                  <Textarea
                    id="edit-desc"
                    value={editProduct.description}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        description: e.target.value,
                      })
                    }
                    className="mt-1 rounded-xl"
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={handleSaveEdit}
                  className="bg-primary text-primary-foreground rounded-xl"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {t(lang, "save")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditProduct(null)}
                  className="rounded-xl"
                >
                  <X className="w-4 h-4 mr-2" />
                  {t(lang, "cancel")}
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-card border border-border rounded-2xl overflow-hidden"
              >
                <div className="relative">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-full h-36 object-cover bg-muted"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      type="button"
                      onClick={() => setEditProduct(p)}
                      className="w-8 h-8 bg-card rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors shadow"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(p.id)}
                      className="w-8 h-8 bg-card rounded-lg flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors shadow"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-semibold text-sm truncate">{p.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-primary font-bold">
                      {currency}
                      {p.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {p.stock} in stock
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Translations Tab */}
        <TabsContent value="translations">
          <h2 className="text-2xl font-bold mb-6">
            {t(lang, "translationTool")}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {allLangs.map((l) => (
              <div
                key={l}
                className="bg-card border border-border rounded-2xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{LANG_LABELS[l]}</h3>
                  <Button
                    size="sm"
                    onClick={() =>
                      toast.success(`${l.toUpperCase()} translations saved`)
                    }
                    className="bg-primary text-primary-foreground rounded-xl text-xs"
                  >
                    {t(lang, "save")}
                  </Button>
                </div>
                <Textarea
                  value={translations[l]}
                  onChange={(e) =>
                    setTranslations((prev) => ({
                      ...prev,
                      [l]: e.target.value,
                    }))
                  }
                  className="font-mono text-xs rounded-xl h-48 resize-none"
                />
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <h2 className="text-2xl font-bold mb-6">{t(lang, "themes")}</h2>
          <div className="max-w-lg bg-card border border-border rounded-2xl p-6 space-y-4">
            <div>
              <label
                htmlFor="store-name"
                className="text-xs uppercase tracking-widest text-muted-foreground"
              >
                {t(lang, "storeName")}
              </label>
              <Input
                id="store-name"
                value={localSettings.storeName}
                onChange={(e) =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    storeName: e.target.value,
                  }))
                }
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <label
                htmlFor="store-tagline"
                className="text-xs uppercase tracking-widest text-muted-foreground"
              >
                {t(lang, "tagline")}
              </label>
              <Input
                id="store-tagline"
                value={localSettings.tagline}
                onChange={(e) =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    tagline: e.target.value,
                  }))
                }
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <label
                htmlFor="store-currency"
                className="text-xs uppercase tracking-widest text-muted-foreground"
              >
                {t(lang, "currency")}
              </label>
              <select
                id="store-currency"
                value={localSettings.currency}
                onChange={(e) =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    currency: e.target.value,
                  }))
                }
                className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background mt-1 focus:outline-none"
              >
                <option value="$">$ USD</option>
                <option value="€">€ EUR</option>
                <option value="£">£ GBP</option>
                <option value="¥">¥ JPY</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="primary-color"
                className="text-xs uppercase tracking-widest text-muted-foreground"
              >
                Primary Color
              </label>
              <div className="flex items-center gap-3 mt-1">
                <input
                  id="primary-color"
                  type="color"
                  value={localSettings.primaryColor}
                  onChange={(e) => {
                    const color = e.target.value;
                    setLocalSettings((prev) => ({
                      ...prev,
                      primaryColor: color,
                    }));
                    // Live preview as user picks color
                    applyPrimaryColor(color);
                  }}
                  className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                />
                <span className="text-sm font-mono text-muted-foreground">
                  {localSettings.primaryColor}
                </span>
                <div
                  className="w-8 h-8 rounded-lg border border-border"
                  style={{ backgroundColor: localSettings.primaryColor }}
                />
              </div>
            </div>
            <Button
              onClick={() => {
                onSaveSettings(localSettings);
                toast.success(t(lang, "settingsSaved"));
              }}
              className="w-full bg-primary text-primary-foreground rounded-xl"
            >
              {t(lang, "saveSettings")}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
