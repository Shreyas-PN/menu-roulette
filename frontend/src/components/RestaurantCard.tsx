"use client";

import { ThumbsUp, ThumbsDown, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import type { Restaurant } from "@/lib/types";

const CUISINE_EMOJIS: Record<string, string> = {
  italian: "🍝",
  mexican: "🌮",
  japanese: "🍣",
  chinese: "🥡",
  indian: "🍛",
  thai: "🍜",
  korean: "🥘",
  vietnamese: "🍲",
  mediterranean: "🫒",
  american: "🍔",
  french: "🥐",
  ethiopian: "🫓",
  greek: "🥙",
  turkish: "🧆",
  peruvian: "🫕",
  brazilian: "🥩",
  jamaican: "🍗",
  lebanese: "🧆",
  spanish: "🥘",
  filipino: "🍖",
  pizza: "🍕",
  burger: "🍔",
  sushi: "🍣",
  seafood: "🦐",
  steak: "🥩",
  cafe: "☕",
  bakery: "🥐",
  dessert: "🍰",
  bar: "🍺",
  restaurant: "🍽️",
};

function getCuisineEmoji(cuisine: string): string {
  const lower = cuisine.toLowerCase();
  for (const [key, emoji] of Object.entries(CUISINE_EMOJIS)) {
    if (lower.includes(key)) return emoji;
  }
  return "🍽️";
}

interface RestaurantCardProps {
  restaurant: Restaurant;
  onUpvote: () => void;
  onDownvote: () => void;
  isWinner?: boolean;
}

export default function RestaurantCard({
  restaurant,
  onUpvote,
  onDownvote,
  isWinner,
}: RestaurantCardProps) {
  const priceLabel = restaurant.price_level
    ? "$".repeat(restaurant.price_level)
    : "$$";

  const emoji = getCuisineEmoji(restaurant.cuisine_type);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`restaurant-card rounded-2xl overflow-hidden border ${
        isWinner
          ? "border-orange-500 bg-orange-500/10 ring-2 ring-orange-500/30"
          : "border-white/5 bg-[#1a1a1a]"
      }`}
    >
      {/* Emoji hero area */}
      <div className="h-28 flex items-center justify-center bg-gradient-to-br from-white/5 to-white/[0.02]">
        <span className="text-6xl">{emoji}</span>
      </div>

      <div className="p-4">
        {/* Name */}
        <h3 className="font-semibold text-sm leading-tight mb-2">
          {restaurant.name}
        </h3>

        {/* Address */}
        {restaurant.address && (
          <div className="flex items-start gap-1 mb-3">
            <MapPin className="w-3 h-3 text-neutral-500 mt-0.5 shrink-0" />
            <p className="text-xs text-neutral-500 line-clamp-1">{restaurant.address}</p>
          </div>
        )}

        {/* Price + Cuisine */}
        <div className="flex gap-2 mb-3">
          <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-neutral-400">
            {priceLabel}
          </span>
          {restaurant.cuisine_type && (
            <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-neutral-400 capitalize">
              {restaurant.cuisine_type}
            </span>
          )}
        </div>

        {/* Votes */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-1">
            <span
              className={`text-sm font-bold ${
                restaurant.vote_count > 0
                  ? "text-green-400"
                  : restaurant.vote_count < 0
                  ? "text-red-400"
                  : "text-neutral-500"
              }`}
            >
              {restaurant.vote_count > 0 ? "+" : ""}
              {restaurant.vote_count}
            </span>
            <span className="text-xs text-neutral-600">votes</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onUpvote}
              className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400
                         transition-colors active:scale-90"
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
            <button
              onClick={onDownvote}
              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400
                         transition-colors active:scale-90"
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}