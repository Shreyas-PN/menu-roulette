"use client";

import { useState, useEffect } from "react";
import { Users, Copy, Check, Loader2 } from "lucide-react";
import { useWebSocket } from "@/hooks/useWebSocket";
import RestaurantCard from "./RestaurantCard";
import SpinWheel from "./SpinWheel";
import { api } from "@/lib/api";
import type { Restaurant, Participant } from "@/lib/types";

interface VotingRoomProps {
  roomCode: string;
  participantId: string;
  nickname: string;
  isHost: boolean;
}

export default function VotingRoom({
  roomCode,
  participantId,
  nickname,
  isHost,
}: VotingRoomProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [view, setView] = useState<"vote" | "spin">("vote");

  const { send, isConnected } = useWebSocket({
    roomCode,
    onMessage: (data) => {
      const msg = data as Record<string, unknown>;
      if (msg.type === "room_state") {
        setRestaurants(msg.restaurants as Restaurant[]);
        setParticipants(msg.participants as Participant[]);
      } else if (msg.type === "vote_update") {
        const updated = msg.restaurant as Restaurant;
        setRestaurants((prev) =>
          prev.map((r) => (r.id === updated.id ? updated : r))
        );
      } else if (msg.type === "spin_result") {
        setWinnerId(msg.winner_id as string);
      } else if (msg.type === "participant_joined") {
        api.getRoom(roomCode).then((room) => setParticipants(room.participants));
      }
    },
  });

  useEffect(() => {
    send({ type: "participant_joined", nickname });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoadRestaurants = async () => {
    setLoading(true);
    try {
      const data = await api.fetchRestaurants(roomCode);
      setRestaurants(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (restaurantId: string, isUpvote: boolean) => {
    try {
      const updated = await api.castVote(roomCode, participantId, restaurantId, isUpvote);
      setRestaurants((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      );
      send({
        type: "vote",
        participant_id: participantId,
        restaurant_id: restaurantId,
        is_upvote: isUpvote,
        nickname,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSpin = (winner: Restaurant) => {
    send({
      type: "spin_result",
      winner_id: winner.id,
      winner_name: winner.name,
    });
    setWinnerId(winner.id);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={copyCode}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10
                       border border-white/10 transition-colors"
          >
            <span className="font-mono font-bold tracking-widest text-orange-400">{roomCode}</span>
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-neutral-400" />}
          </button>
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <Users className="w-4 h-4" />
            <span>{participants.length} joined</span>
            <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"}`} />
          </div>
        </div>

        <div className="flex gap-1 p-1 rounded-xl bg-white/5">
          <button
            onClick={() => setView("vote")}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              view === "vote" ? "bg-orange-500 text-white" : "text-neutral-400 hover:text-white"
            }`}
          >
            Vote
          </button>
          <button
            onClick={() => setView("spin")}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              view === "spin" ? "bg-orange-500 text-white" : "text-neutral-400 hover:text-white"
            }`}
          >
            Spin
          </button>
        </div>
      </div>

      {restaurants.length === 0 && (
        <div className="text-center py-16">
          {isHost ? (
            <div className="space-y-4">
              <p className="text-neutral-400">No restaurants loaded yet.</p>
              <button
                onClick={handleLoadRestaurants}
                disabled={loading}
                className="px-8 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 font-medium
                           transition-colors flex items-center gap-2 mx-auto disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Find Restaurants Nearby
              </button>
            </div>
          ) : (
            <p className="text-neutral-400">Waiting for host to load restaurants...</p>
          )}
        </div>
      )}

      {view === "vote" && restaurants.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...restaurants]
            .sort((a, b) => b.vote_count - a.vote_count)
            .map((r) => (
              <RestaurantCard
                key={r.id}
                restaurant={r}
                onUpvote={() => handleVote(r.id, true)}
                onDownvote={() => handleVote(r.id, false)}
                isWinner={r.id === winnerId}
              />
            ))}
        </div>
      )}

      {view === "spin" && restaurants.length > 0 && (
        <SpinWheel
          restaurants={restaurants}
          onSpinComplete={handleSpin}
        />
      )}
    </div>
  );
}