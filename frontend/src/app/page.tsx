"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Loader2, ArrowRight, Users, Search, X } from "lucide-react";
import Header from "@/components/Header";
import BudgetSlider from "@/components/BudgetSlider";
import CuisineSelector from "@/components/CuisineSelector";
import MoodPicker from "@/components/MoodPicker";
import { api } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState<"home" | "create" | "join">("home");
  const [nickname, setNickname] = useState("");
  const [budget, setBudget] = useState("$$");
  const [cuisine, setCuisine] = useState("");
  const [moodReason, setMoodReason] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLabel, setLocationLabel] = useState("");
  const [locationMode, setLocationMode] = useState<"gps" | "manual">("gps");
  const [manualAddress, setManualAddress] = useState("");
  const [geocodeLoading, setGeocodeLoading] = useState(false);
  const [error, setError] = useState("");

  const getLocation = () => {
    setLocationLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationLabel("Current location");
        setLocationLoading(false);
      },
      () => {
        setError("Couldn't get your location. Try entering it manually.");
        setLocationMode("manual");
        setLocationLoading(false);
      }
    );
  };

  const geocodeAddress = async () => {
    if (!manualAddress.trim()) return;
    setGeocodeLoading(true);
    setError("");

    try {
      // Using OpenStreetMap Nominatim (free, no API key needed)
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          manualAddress.trim()
        )}&limit=1`,
        { headers: { "User-Agent": "MenuRoulette/1.0" } }
      );
      const data = await res.json();

      if (data.length === 0) {
        setError("Couldn't find that location. Try a city name or zip code.");
        return;
      }

      setLocation({
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      });
      setLocationLabel(data[0].display_name.split(",").slice(0, 2).join(","));
    } catch {
      setError("Geocoding failed. Check your connection and try again.");
    } finally {
      setGeocodeLoading(false);
    }
  };

  const clearLocation = () => {
    setLocation(null);
    setLocationLabel("");
    setManualAddress("");
  };

  const handleCreate = async () => {
    if (!nickname.trim() || !location) return;
    setLoading(true);
    setError("");

    try {
      const result = await api.createRoom({
        nickname: nickname.trim(),
        latitude: location.lat,
        longitude: location.lng,
        budget,
      });

      // Set cuisine if selected
      if (cuisine) {
        await api.setCuisine(result.room.code, cuisine);
      }

      // Store participant info in sessionStorage
      sessionStorage.setItem("participantId", result.participant_id);
      sessionStorage.setItem("nickname", nickname.trim());
      sessionStorage.setItem("isHost", "true");

      router.push(`/room/${result.room.code}`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!nickname.trim() || !joinCode.trim()) return;
    setLoading(true);
    setError("");

    try {
      const result = await api.joinRoom({
        nickname: nickname.trim(),
        code: joinCode.trim().toUpperCase(),
      });

      sessionStorage.setItem("participantId", result.participant_id);
      sessionStorage.setItem("nickname", nickname.trim());
      sessionStorage.setItem("isHost", "false");

      router.push(`/room/${result.room.code}`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-md mx-auto px-4 py-12">
        {/* Home screen */}
        {step === "home" && (
          <div className="space-y-8 text-center">
            <div className="space-y-3">
              <h2 className="text-4xl font-bold tracking-tight">
                Can't decide <br /> where to eat?
              </h2>
              <p className="text-neutral-400">
                Spin the wheel. Let your friends vote. No more 45-minute debates.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setStep("create")}
                className="w-full py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 font-semibold
                           text-lg transition-all hover:scale-[1.02] active:scale-[0.98]
                           shadow-lg shadow-orange-500/25"
              >
                Start a Room
              </button>
              <button
                onClick={() => setStep("join")}
                className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 font-semibold
                           text-lg border border-white/10 transition-all"
              >
                <span className="flex items-center justify-center gap-2">
                  <Users className="w-5 h-5" />
                  Join a Room
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Create room */}
        {step === "create" && (
          <div className="space-y-6">
            <button
              onClick={() => setStep("home")}
              className="text-sm text-neutral-500 hover:text-white transition-colors"
            >
              &larr; Back
            </button>

            <h2 className="text-2xl font-bold">Set up your room</h2>

            {/* Nickname */}
            <div className="space-y-2">
              <label className="text-sm text-neutral-400">Your name</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="What should we call you?"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3
                           placeholder:text-neutral-600 focus:outline-none focus:border-orange-500/50"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-sm text-neutral-400">Location</label>

              {location ? (
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400 truncate max-w-[250px]">
                      {locationLabel}
                    </span>
                  </div>
                  <button onClick={clearLocation} className="text-neutral-500 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  {/* Toggle between GPS and manual */}
                  <div className="flex gap-1 p-1 rounded-xl bg-white/5">
                    <button
                      onClick={() => setLocationMode("gps")}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs transition-colors ${
                        locationMode === "gps"
                          ? "bg-orange-500 text-white"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      Use my location
                    </button>
                    <button
                      onClick={() => setLocationMode("manual")}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs transition-colors ${
                        locationMode === "manual"
                          ? "bg-orange-500 text-white"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      Enter address
                    </button>
                  </div>

                  {locationMode === "gps" ? (
                    <button
                      onClick={getLocation}
                      disabled={locationLoading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                                 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      {locationLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}
                      <span className="text-sm">Detect My Location</span>
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={manualAddress}
                        onChange={(e) => setManualAddress(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && geocodeAddress()}
                        placeholder="e.g. Boston, MA or 10001"
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm
                                   placeholder:text-neutral-600 focus:outline-none focus:border-orange-500/50
                                   transition-colors"
                      />
                      <button
                        onClick={geocodeAddress}
                        disabled={geocodeLoading || !manualAddress.trim()}
                        className="px-4 py-3 rounded-xl bg-orange-500 hover:bg-orange-600
                                   disabled:opacity-40 disabled:cursor-not-allowed transition-colors
                                   flex items-center gap-2"
                      >
                        {geocodeLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Search className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <label className="text-sm text-neutral-400">Budget</label>
              <BudgetSlider selected={budget} onChange={setBudget} />
            </div>

            {/* Cuisine */}
            <div className="space-y-2">
              <label className="text-sm text-neutral-400">Cuisine (optional)</label>
              <CuisineSelector selected={cuisine} onChange={setCuisine} />
            </div>

            {/* AI Mood Picker */}
            <MoodPicker
              onCuisineSelected={(c, reason) => {
                setCuisine(c);
                setMoodReason(reason);
              }}
            />

            {moodReason && (
              <div className="px-4 py-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-sm">
                <span className="text-orange-400 font-medium">{cuisine}</span>
                <span className="text-neutral-400"> - {moodReason}</span>
              </div>
            )}

            {error && <p className="text-red-400 text-sm">{error}</p>}

            {/* Create button */}
            <button
              onClick={handleCreate}
              disabled={loading || !nickname.trim() || !location}
              className="w-full py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 font-semibold
                         text-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
              Create Room
            </button>
          </div>
        )}

        {/* Join room */}
        {step === "join" && (
          <div className="space-y-6">
            <button
              onClick={() => setStep("home")}
              className="text-sm text-neutral-500 hover:text-white transition-colors"
            >
              &larr; Back
            </button>

            <h2 className="text-2xl font-bold">Join a room</h2>

            <div className="space-y-2">
              <label className="text-sm text-neutral-400">Your name</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="What should we call you?"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3
                           placeholder:text-neutral-600 focus:outline-none focus:border-orange-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-neutral-400">Room code</label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3
                           font-mono text-2xl tracking-[0.3em] text-center uppercase
                           placeholder:text-neutral-600 placeholder:text-base placeholder:tracking-normal
                           focus:outline-none focus:border-orange-500/50"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              onClick={handleJoin}
              disabled={loading || !nickname.trim() || joinCode.length < 6}
              className="w-full py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 font-semibold
                         text-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
              Join Room
            </button>
          </div>
        )}
      </main>
    </div>
  );
}