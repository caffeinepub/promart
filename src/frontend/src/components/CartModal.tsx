import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { t } from "../lib/i18n";
import type { CartItem, Language } from "../lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  cart: CartItem[];
  total: number;
  currency: string;
  lang: Language;
  onUpdateQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

export function CartModal({
  open,
  onClose,
  cart,
  total,
  currency,
  lang,
  onUpdateQty,
  onRemove,
  onCheckout,
}: Props) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            {t(lang, "yourCart")}
            {cart.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({cart.reduce((s, i) => s + i.quantity, 0)} items)
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-3">
              <ShoppingBag className="w-12 h-12 opacity-30" />
              <p>{t(lang, "emptyCart")}</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="flex gap-3 items-start">
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-16 h-16 rounded-xl object-cover bg-muted flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-tight truncate">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {currency}
                    {item.product.price.toFixed(2)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateQty(item.product.id, item.quantity - 1)
                      }
                      className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-medium w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateQty(item.product.id, item.quantity + 1)
                      }
                      className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-bold text-sm">
                    {currency}
                    {(item.product.price * item.quantity).toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemove(item.product.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-border pt-4 space-y-3">
            <div className="flex justify-between font-semibold text-lg">
              <span>{t(lang, "subtotal")}</span>
              <span>
                {currency}
                {total.toFixed(2)}
              </span>
            </div>
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold py-6 text-base"
              onClick={onCheckout}
            >
              {t(lang, "checkout")}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
