export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  gender: string;
  color: string;
  size: string;
  imageUrl: string;
  stock: number;
  rating: number;
  reviews: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type SortMode = "name-asc" | "name-desc" | "price-asc" | "price-desc";

export type Language =
  | "en"
  | "es"
  | "fr"
  | "de"
  | "da"
  | "uk"
  | "ro"
  | "it"
  | "pl";

export interface ShopSettings {
  storeName: string;
  currency: string;
  primaryColor: string;
  tagline: string;
}

export interface Translations {
  [key: string]: string;
}

export interface I18nMap {
  en: Translations;
  es: Translations;
  fr: Translations;
  de: Translations;
  da: Translations;
  uk: Translations;
  ro: Translations;
  it: Translations;
  pl: Translations;
}
