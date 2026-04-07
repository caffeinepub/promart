import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ShoppingCart, X, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { t } from "../lib/i18n";
import type { Language, Product } from "../lib/types";
import { StarRating } from "./StarRating";

interface Props {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  lang: Language;
  currency: string;
  onAddToCart: (p: Product) => void;
}

export function ProductDetailModal({
  product,
  open,
  onClose,
  lang,
  currency,
  onAddToCart,
}: Props) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{
    x: number;
    y: number;
    ox: number;
    oy: number;
  } | null>(null);
  const imgContainerRef = useRef<HTMLDivElement>(null);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.5, 4));
  const handleZoomOut = () => {
    setZoom((z) => {
      const next = Math.max(z - 0.5, 1);
      if (next === 1) setOffset({ x: 0, y: 0 });
      return next;
    });
  };

  // Mouse drag to pan when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      ox: offset.x,
      oy: offset.y,
    };
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart.current) return;
    setOffset({
      x: dragStart.current.ox + (e.clientX - dragStart.current.x),
      y: dragStart.current.oy + (e.clientY - dragStart.current.y),
    });
  };
  const handleMouseUp = () => setIsDragging(false);

  // Scroll to zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => {
      const next = e.deltaY < 0 ? Math.min(z + 0.25, 4) : Math.max(z - 0.25, 1);
      if (next === 1) setOffset({ x: 0, y: 0 });
      return next;
    });
  };

  if (!product) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          resetZoom();
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <div className="grid grid-cols-2 max-sm:grid-cols-1">
          {/* Zoomable image panel */}
          <div
            ref={imgContainerRef}
            className="bg-muted relative overflow-hidden select-none"
            style={{
              aspectRatio: "1 / 1",
              cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleZoomIn();
            }}
            onClick={() => {
              if (!isDragging && zoom === 1) handleZoomIn();
            }}
          >
            <img
              src={product.imageUrl}
              alt={product.name}
              draggable={false}
              className="w-full h-full object-cover transition-transform duration-150"
              style={{
                transform: `scale(${zoom}) translate(${offset.x / zoom}px, ${offset.y / zoom}px)`,
                transformOrigin: "center",
              }}
            />

            {/* Zoom controls */}
            <div className="absolute bottom-3 right-3 flex gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomOut();
                }}
                disabled={zoom <= 1}
                className="w-8 h-8 rounded-lg bg-black/50 text-white flex items-center justify-center hover:bg-black/70 disabled:opacity-30 transition-colors"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomIn();
                }}
                disabled={zoom >= 4}
                className="w-8 h-8 rounded-lg bg-black/50 text-white flex items-center justify-center hover:bg-black/70 disabled:opacity-30 transition-colors"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom level badge */}
            {zoom > 1 && (
              <div className="absolute top-3 left-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetZoom();
                  }}
                  className="px-2 py-1 rounded-lg bg-black/50 text-white text-xs font-mono hover:bg-black/70 transition-colors"
                >
                  {zoom.toFixed(1)}x &times; reset
                </button>
              </div>
            )}

            {/* Hint */}
            {zoom === 1 && (
              <div className="absolute bottom-3 left-3 px-2 py-1 rounded-lg bg-black/40 text-white text-[10px] pointer-events-none">
                Click or scroll to zoom
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="p-6 flex flex-col">
            <Badge className="self-start mb-3 bg-primary text-primary-foreground">
              {product.category}
            </Badge>
            <h2 className="text-2xl font-bold leading-tight mb-2">
              {product.name}
            </h2>
            <StarRating rating={product.rating} reviews={product.reviews} />
            <p className="text-muted-foreground text-sm mt-3 flex-1">
              {product.description}
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="text-muted-foreground w-16">Gender:</span>
                <span className="capitalize">{product.gender}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground w-16">Color:</span>
                <span>{product.color}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground w-16">Size:</span>
                <span>{product.size}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground w-16">Stock:</span>
                <span>
                  {product.stock > 0
                    ? `${product.stock} ${t(lang, "inStock")}`
                    : t(lang, "outOfStock")}
                </span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">
                {currency}
                {product.price.toFixed(2)}
              </p>
            </div>
            <Button
              className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleZoomIn();
              }}
              onClick={() => {
                onAddToCart(product);
                onClose();
                resetZoom();
              }}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {t(lang, "addToCart")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
