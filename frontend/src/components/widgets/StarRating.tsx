"use client";

import { useState } from "react";
import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  disabled?: boolean;
}

const STAR_COUNT = 5;

function starValueFromOffset(starIndex: number, offsetRatio: number): number {
  const half = offsetRatio < 0.5;
  return (starIndex + (half ? 0.5 : 1)) * 2;
}

export function StarRating({ value, onChange, disabled }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const displayValue = hoverValue ?? value ?? 0;
  const displayStars = displayValue / 2;

  return (
    <div
      className="flex items-center gap-1"
      onMouseLeave={() => setHoverValue(null)}
    >
      {Array.from({ length: STAR_COUNT }).map((_, i) => {
        const filled = displayStars >= i + 1;
        const half = !filled && displayStars > i && displayStars < i + 1;

        return (
          <button
            key={i}
            type="button"
            disabled={disabled}
            className="text-primary disabled:opacity-50"
            onMouseMove={(e) => {
              if (disabled) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const offsetRatio = (e.clientX - rect.left) / rect.width;
              setHoverValue(starValueFromOffset(i, offsetRatio));
            }}
            onClick={(e) => {
              if (disabled) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const offsetRatio = (e.clientX - rect.left) / rect.width;
              const next = starValueFromOffset(i, offsetRatio);
              onChange(next === value ? undefined : next);
            }}
          >
            {half ? (
              <StarHalf className="h-6 w-6 fill-current" />
            ) : (
              <Star className={cn("h-6 w-6", filled && "fill-current")} />
            )}
          </button>
        );
      })}
      {value !== undefined && (
        <span className="text-muted-foreground ml-2 text-sm">
          {(value / 2).toFixed(1)} / 5
        </span>
      )}
    </div>
  );
}
