"use client";

import { Utensils } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b border-white/5 px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center gap-3">
        <div className="p-2 rounded-xl bg-orange-500/10">
          <Utensils className="w-6 h-6 text-orange-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Menu Roulette</h1>
          <p className="text-xs text-neutral-500">spin it. eat it. no regrets.</p>
        </div>
      </div>
    </header>
  );
}