import requests


def search_nearby_restaurants(latitude, longitude, cuisine="", budget="$$", radius=5000):
    """
    Search for restaurants near a location using OpenStreetMap Overpass API.
    Completely free, no API key needed.
    """
    overpass_url = "https://overpass-api.de/api/interpreter"

    cuisine_filter = ""
    if cuisine:
        cuisine_lower = cuisine.lower()
        cuisine_filter = f'["cuisine"~"{cuisine_lower}",i]'

    query = f"""
    [out:json][timeout:10];
    (
      node["amenity"="restaurant"]{cuisine_filter}(around:{radius},{latitude},{longitude});
      way["amenity"="restaurant"]{cuisine_filter}(around:{radius},{latitude},{longitude});
    );
    out center body qt 20;
    """

    try:
        response = requests.post(overpass_url, data={"data": query}, timeout=15)
        data = response.json()
    except Exception as e:
        print(f"Overpass API error: {e}")
        return []

    budget_price_map = {"$": 1, "$$": 2, "$$$": 3, "$$$$": 4}
    price_level = budget_price_map.get(budget, 2)

    restaurants = []
    for element in data.get("elements", []):
        tags = element.get("tags", {})
        name = tags.get("name")
        if not name:
            continue

        lat = element.get("lat") or element.get("center", {}).get("lat")
        lon = element.get("lon") or element.get("center", {}).get("lon")

        if not lat or not lon:
            continue

        address_parts = []
        if tags.get("addr:housenumber"):
            address_parts.append(tags["addr:housenumber"])
        if tags.get("addr:street"):
            address_parts.append(tags["addr:street"])
        if tags.get("addr:city"):
            address_parts.append(tags["addr:city"])
        address = ", ".join(address_parts) if address_parts else tags.get("addr:full", "")

        cuisine_type = tags.get("cuisine", cuisine or "restaurant")
        if ";" in cuisine_type:
            cuisine_type = cuisine_type.split(";")[0]

        restaurants.append({
            "place_id": str(element.get("id", "")),
            "name": name,
            "address": address,
            "rating": None,
            "price_level": price_level,
            "photo_url": "",
            "cuisine_type": cuisine_type,
            "latitude": lat,
            "longitude": lon,
        })

    print(f"OVERPASS RESPONSE: Found {len(restaurants)} restaurants")
    return restaurants[:15]