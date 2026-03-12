"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface MoodPickerProps {
  onCuisineSelected: (cuisine: string, reason: string) => void;
}

export default function MoodPicker({ onCuisineSelected }: MoodPickerProps) {
  const [mood, setMood] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!mood.trim()) return;
    setLoading(true);
    setError("");

    try {
      const result = await api.moodToCuisine(mood);
      onCuisineSelected(result.cuisine, result.reason);
    } catch (e: any) {
      setError(e.message || "AI couldn't figure out your vibe. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-orange-400">
        <Sparkles className="w-4 h-4" />
        <span>Or describe your mood and let AI pick</span>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="e.g. cozy rainy day vibes, need comfort food..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm
                     placeholder:text-neutral-600 focus:outline-none focus:border-orange-500/50
                     transition-colors"
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !mood.trim()}
          className="px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40
                     disabled:cursor-not-allowed transition-colors text-sm font-medium
                     flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Vibe Check
        </button>
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}