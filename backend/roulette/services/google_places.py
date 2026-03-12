import requests
from django.conf import settings


def search_nearby_restaurants(latitude, longitude, cuisine="", budget="$$", radius=3000):
    """
    Search for restaurants near a location using Google Places API (legacy).

    Args:
        latitude: float
        longitude: float
        cuisine: cuisine type string (e.g., "italian", "mexican")
        budget: one of "$", "$$", "$$$", "$$$$"
        radius: search radius in meters (default 3km)

    Returns:
        list of restaurant dicts
    """
    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"

    # Map budget to min/max price levels (0-4)
    budget_map = {
        "$": (0, 1),
        "$$": (1, 2),
        "$$$": (2, 3),
        "$$$$": (3, 4),
    }
    min_price, max_price = budget_map.get(budget, (1, 2))

    params = {
        "location": f"{latitude},{longitude}",
        "radius": radius,
        "type": "restaurant",
        "key": settings.GOOGLE_PLACES_API_KEY,
        "minprice": min_price,
        "maxprice": max_price,
    }

    if cuisine:
        params["keyword"] = cuisine

    response = requests.get(url, params=params)
    data = response.json()

    restaurants = []
    for place in data.get("results", []):
        photo_url = ""
        photos = place.get("photos", [])
        if photos:
            photo_ref = photos[0].get("photo_reference", "")
            if photo_ref:
                photo_url = (
                    f"https://maps.googleapis.com/maps/api/place/photo"
                    f"?maxwidth=400&photo_reference={photo_ref}"
                    f"&key={settings.GOOGLE_PLACES_API_KEY}"
                )

        location = place.get("geometry", {}).get("location", {})

        restaurants.append({
            "place_id": place.get("place_id", ""),
            "name": place.get("name", "Unknown"),
            "address": place.get("vicinity", ""),
            "rating": place.get("rating"),
            "price_level": place.get("price_level"),
            "photo_url": photo_url,
            "cuisine_type": cuisine or place.get("types", ["restaurant"])[0],
            "latitude": location.get("lat"),
            "longitude": location.get("lng"),
        })

    return restaurants