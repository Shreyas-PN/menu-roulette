"use client";

const CUISINES = [
  { emoji: "🍝", name: "Italian" },
  { emoji: "🌮", name: "Mexican" },
  { emoji: "🍣", name: "Japanese" },
  { emoji: "🥡", name: "Chinese" },
  { emoji: "🍛", name: "Indian" },
  { emoji: "🍜", name: "Thai" },
  { emoji: "🥘", name: "Korean" },
  { emoji: "🍲", name: "Vietnamese" },
  { emoji: "🫒", name: "Mediterranean" },
  { emoji: "🍔", name: "American" },
  { emoji: "🥐", name: "French" },
  { emoji: "🫓", name: "Ethiopian" },
  { emoji: "🥙", name: "Greek" },
  { emoji: "🧆", name: "Turkish" },
  { emoji: "🫕", name: "Peruvian" },
  { emoji: "🥩", name: "Brazilian" },
];

interface CuisineSelectorProps {
  selected: string;
  onChange: (cuisine: string) => void;
}

export default function CuisineSelector({ selected, onChange }: CuisineSelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {CUISINES.map((c) => (
        <button
          key={c.name}
          onClick={() => onChange(selected === c.name ? "" : c.name)}
          className={`py-3 px-2 rounded-xl text-center transition-all ${
            selected === c.name
              ? "bg-orange-500/20 border border-orange-500/50 text-white"
              : "bg-white/5 text-neutral-400 hover:bg-white/10 border border-transparent"
          }`}
        >
          <div className="text-2xl">{c.emoji}</div>
          <div className="text-[11px] mt-1">{c.name}</div>
        </button>
      ))}
    </div>
  );
}