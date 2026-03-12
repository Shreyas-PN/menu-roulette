export interface Participant {
  id: string;
  nickname: string;
  is_host: boolean;
  joined_at: string;
}

export interface Restaurant {
  id: string;
  place_id: string;
  name: string;
  address: string;
  rating: number | null;
  price_level: number | null;
  photo_url: string;
  cuisine_type: string;
  latitude: number | null;
  longitude: number | null;
  vote_count: number;
}

export interface Room {
  id: string;
  code: string;
  created_at: string;
  latitude: number | null;
  longitude: number | null;
  budget: string;
  cuisine: string;
  is_active: boolean;
  participants: Participant[];
  restaurants: Restaurant[];
}

export interface SpinResult {
  id: string;
  restaurant: Restaurant;
  spun_at: string;
}

export interface MoodResult {
  cuisine: string;
  reason: string;
}