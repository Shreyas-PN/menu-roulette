const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Something went wrong");
  }
  return res.json();
}

export const api = {
  createRoom: (data: {
    nickname: string;
    latitude: number;
    longitude: number;
    budget: string;
  }) => apiFetch<{ room: import("./types").Room; participant_id: string }>(
    "/rooms/", { method: "POST", body: JSON.stringify(data) }
  ),

  joinRoom: (data: { nickname: string; code: string }) =>
    apiFetch<{ room: import("./types").Room; participant_id: string }>(
      "/rooms/join/", { method: "POST", body: JSON.stringify(data) }
    ),

  getRoom: (code: string) =>
    apiFetch<import("./types").Room>(`/rooms/${code}/`),

  setCuisine: (code: string, cuisine: string) =>
    apiFetch<{ cuisine: string }>(
      `/rooms/${code}/cuisine/`, { method: "POST", body: JSON.stringify({ cuisine }) }
    ),

  moodToCuisine: (mood: string) =>
    apiFetch<import("./types").MoodResult>(
      "/mood/", { method: "POST", body: JSON.stringify({ mood }) }
    ),

  fetchRestaurants: (code: string) =>
    apiFetch<import("./types").Restaurant[]>(
      `/rooms/${code}/restaurants/`, { method: "POST" }
    ),

  castVote: (code: string, participantId: string, restaurantId: string, isUpvote: boolean) =>
    apiFetch<import("./types").Restaurant>(
      `/rooms/${code}/vote/`,
      {
        method: "POST",
        body: JSON.stringify({
          participant_id: participantId,
          restaurant_id: restaurantId,
          is_upvote: isUpvote,
        }),
      }
    ),

  spinWheel: (code: string) =>
    apiFetch<{ spin_result: import("./types").SpinResult; all_restaurants: import("./types").Restaurant[] }>(
      `/rooms/${code}/spin/`, { method: "POST" }
    ),
};