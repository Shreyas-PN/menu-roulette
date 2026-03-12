"use client";

const BUDGETS = [
  { value: "$", label: "$", desc: "Budget-friendly" },
  { value: "$$", label: "$$", desc: "Mid-range" },
  { value: "$$$", label: "$$$", desc: "Upscale" },
  { value: "$$$$", label: "$$$$", desc: "Fine dining" },
];

interface BudgetSliderProps {
  selected: string;
  onChange: (budget: string) => void;
}

export default function BudgetSlider({ selected, onChange }: BudgetSliderProps) {
  return (
    <div className="flex gap-2">
      {BUDGETS.map((b) => (
        <button
          key={b.value}
          onClick={() => onChange(b.value)}
          className={`flex-1 py-3 px-2 rounded-xl text-center transition-all ${
            selected === b.value
              ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
              : "bg-white/5 text-neutral-400 hover:bg-white/10"
          }`}
        >
          <div className="text-lg font-bold">{b.label}</div>
          <div className="text-[10px] mt-0.5 opacity-70">{b.desc}</div>
        </button>
      ))}
    </div>
  );
}