import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { t } from "../lib/i18n";
import type { Language, Product } from "../lib/types";
import { StarRating } from "./StarRating";

interface Props {
  product: Product;
  lang: Language;
  currency: string;
  onAddToCart: (p: Product) => void;
  onCardClick: (p: Product) => void;
}

export function ProductCard({
  product,
  lang,
  currency,
  onAddToCart,
  onCardClick,
}: Props) {
  return (
    <article
      className="product-card bg-card border border-border rounded-2xl overflow-hidden cursor-pointer group"
      itemScope
      itemType="https://schema.org/Product"
    >
      <button
        type="button"
        className="relative overflow-hidden bg-muted aspect-square w-full block"
        onClick={() => onCardClick(product)}
        aria-label={`View details for ${product.name}`}
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          itemProp="image"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <span className="text-sm font-semibold text-muted-foreground">
              {t(lang, "outOfStock")}
            </span>
          </div>
        )}
        <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] font-medium">
          {product.category}
        </Badge>
      </button>
      <div className="p-4">
        <h3
          itemProp="name"
          className="font-semibold text-sm leading-snug mb-1 line-clamp-2"
        >
          {product.name}
        </h3>
        <StarRating rating={product.rating} reviews={product.reviews} />
        <div className="flex items-center justify-between mt-3">
          <span itemProp="price" className="font-bold text-lg">
            {currency}
            {product.price.toFixed(2)}
          </span>
          <span className="text-xs text-muted-foreground">
            {product.stock > 0 ? `${product.stock} left` : ""}
          </span>
        </div>
        <Button
          size="sm"
          className="w-full mt-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-semibold"
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          disabled={product.stock === 0}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {t(lang, "addToCart")}
        </Button>
      </div>
    </article>
  );
}
