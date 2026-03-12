"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import type { Restaurant } from "@/lib/types";

interface SpinWheelProps {
  restaurants: Restaurant[];
  onSpinComplete: (winner: Restaurant) => void;
  disabled?: boolean;
}

// Color palette for wheel segments
const COLORS = [
  "#f97316", "#3b82f6", "#22c55e", "#a855f7", "#ef4444",
  "#14b8a6", "#f59e0b", "#ec4899", "#6366f1", "#06b6d4",
  "#84cc16", "#e11d48", "#8b5cf6", "#10b981", "#f43f5e",
];

export default function SpinWheel({ restaurants, onSpinComplete, disabled }: SpinWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<Restaurant | null>(null);
  const winnerRef = useRef<Restaurant | null>(null);

  const segmentAngle = restaurants.length > 0 ? 360 / restaurants.length : 360;

  const spin = () => {
    if (spinning || restaurants.length === 0 || disabled) return;

    setSpinning(true);
    setWinner(null);

    // Random number of full rotations (5-8) + random landing angle
    const fullSpins = 5 + Math.random() * 3;
    const landingAngle = Math.random() * 360;
    const totalRotation = rotation + fullSpins * 360 + landingAngle;

    setRotation(totalRotation);

    // Calculate winner based on where it lands
    // The pointer is at the top (0 degrees), so we need to find which segment is there
    const normalizedAngle = (360 - (totalRotation % 360)) % 360;
    const winnerIndex = Math.floor(normalizedAngle / segmentAngle) % restaurants.length;
    winnerRef.current = restaurants[winnerIndex];

    // Wait for animation to finish
    setTimeout(() => {
      setSpinning(false);
      setWinner(winnerRef.current);
      if (winnerRef.current) {
        onSpinComplete(winnerRef.current);
      }
    }, 4000);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Pointer */}
      <div className="text-3xl">&#9660;</div>

      {/* Wheel */}
      <div className="relative wheel-glow rounded-full">
        <motion.svg
          width={320}
          height={320}
          viewBox="-160 -160 320 320"
          animate={{ rotate: rotation }}
          transition={{ duration: 4, ease: [0.2, 0.8, 0.2, 1] }}
          className="drop-shadow-2xl"
        >
          {restaurants.map((r, i) => {
            const startAngle = i * segmentAngle;
            const endAngle = startAngle + segmentAngle;
            const startRad = (startAngle - 90) * (Math.PI / 180);
            const endRad = (endAngle - 90) * (Math.PI / 180);
            const radius = 155;
            const x1 = radius * Math.cos(startRad);
            const y1 = radius * Math.sin(startRad);
            const x2 = radius * Math.cos(endRad);
            const y2 = radius * Math.sin(endRad);
            const largeArc = segmentAngle > 180 ? 1 : 0;

            // Label position
            const midAngle = ((startAngle + endAngle) / 2 - 90) * (Math.PI / 180);
            const labelR = radius * 0.65;
            const lx = labelR * Math.cos(midAngle);
            const ly = labelR * Math.sin(midAngle);
            const textAngle = (startAngle + endAngle) / 2;

            return (
              <g key={r.id}>
                <path
                  d={`M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={COLORS[i % COLORS.length]}
                  stroke="#0a0a0a"
                  strokeWidth="2"
                />
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${textAngle}, ${lx}, ${ly})`}
                  className="fill-white text-[9px] font-medium"
                  style={{ pointerEvents: "none" }}
                >
                  {r.name.length > 14 ? r.name.slice(0, 12) + "..." : r.name}
                </text>
              </g>
            );
          })}
          {/* Center circle */}
          <circle r="25" fill="#0a0a0a" />
          <circle r="22" fill="#1a1a1a" />
        </motion.svg>
      </div>

      {/* Spin button */}
      <button
        onClick={spin}
        disabled={spinning || restaurants.length === 0 || disabled}
        className={`px-10 py-4 rounded-2xl font-bold text-lg transition-all ${
          spinning
            ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
            : "bg-orange-500 hover:bg-orange-600 hover:scale-105 active:scale-95 shadow-lg shadow-orange-500/25"
        }`}
      >
        {spinning ? "Spinning..." : winner ? "Spin Again!" : "SPIN!"}
      </button>

      {/* Winner announcement */}
      {winner && !spinning && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-6 rounded-2xl bg-orange-500/10 border border-orange-500/30"
        >
          <p className="text-sm text-orange-400 mb-1">You're eating at...</p>
          <p className="text-2xl font-bold">{winner.name}</p>
          <p className="text-sm text-neutral-400 mt-1">{winner.address}</p>
        </motion.div>
      )}
    </div>
  );
}