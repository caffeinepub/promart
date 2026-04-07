import { Star } from "lucide-react";

export function StarRating({
  rating,
  reviews,
}: { rating: number; reviews: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3 h-3 ${
            star <= Math.floor(rating)
              ? "fill-yellow-400 text-yellow-400"
              : star - 0.5 <= rating
                ? "fill-yellow-200 text-yellow-400"
                : "text-muted-foreground"
          }`}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1">({reviews})</span>
    </div>
  );
}
