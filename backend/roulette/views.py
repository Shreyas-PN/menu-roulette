import random
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Room, Participant, Restaurant, Vote, SpinResult
from .serializers import (
    RoomSerializer, CreateRoomSerializer, JoinRoomSerializer,
    MoodSerializer, RestaurantSerializer, SpinResultSerializer,
)
from .services.google_places import search_nearby_restaurants
from .services.ai_mood import get_cuisine_from_mood


@api_view(["POST"])
def create_room(request):
    """Create a new room and return room code + participant ID."""
    serializer = CreateRoomSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    room = Room.objects.create(
        latitude=data["latitude"],
        longitude=data["longitude"],
        budget=data["budget"],
    )

    participant = Participant.objects.create(
        room=room,
        nickname=data["nickname"],
        is_host=True,
    )

    return Response({
        "room": RoomSerializer(room).data,
        "participant_id": str(participant.id),
    }, status=status.HTTP_201_CREATED)


@api_view(["POST"])
def join_room(request):
    """Join an existing room by code."""
    serializer = JoinRoomSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    try:
        room = Room.objects.get(code=data["code"].upper(), is_active=True)
    except Room.DoesNotExist:
        return Response(
            {"error": "Room not found or no longer active."},
            status=status.HTTP_404_NOT_FOUND,
        )

    participant = Participant.objects.create(
        room=room,
        nickname=data["nickname"],
    )

    return Response({
        "room": RoomSerializer(room).data,
        "participant_id": str(participant.id),
    })


@api_view(["GET"])
def get_room(request, code):
    """Get room details by code."""
    try:
        room = Room.objects.get(code=code.upper())
    except Room.DoesNotExist:
        return Response(
            {"error": "Room not found."},
            status=status.HTTP_404_NOT_FOUND,
        )
    return Response(RoomSerializer(room).data)


@api_view(["POST"])
def set_cuisine(request, code):
    """Set the cuisine for a room (manually or from AI mood)."""
    try:
        room = Room.objects.get(code=code.upper())
    except Room.DoesNotExist:
        return Response({"error": "Room not found."}, status=status.HTTP_404_NOT_FOUND)

    cuisine = request.data.get("cuisine", "")
    room.cuisine = cuisine
    room.save()

    return Response({"cuisine": cuisine})


@api_view(["POST"])
def mood_to_cuisine(request):
    """Use AI to convert a mood description into a cuisine pick."""
    serializer = MoodSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    try:
        result = get_cuisine_from_mood(serializer.validated_data["mood"])
        return Response(result)
    except Exception as e:
        return Response(
            {"error": f"AI service error: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
def fetch_restaurants(request, code):
    """Fetch nearby restaurants from Google Places and save to room."""
    try:
        room = Room.objects.get(code=code.upper())
    except Room.DoesNotExist:
        return Response({"error": "Room not found."}, status=status.HTTP_404_NOT_FOUND)

    if not room.latitude or not room.longitude:
        return Response(
            {"error": "Room location not set."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Clear existing restaurants for this room
    room.restaurants.all().delete()

    restaurants_data = search_nearby_restaurants(
        latitude=room.latitude,
        longitude=room.longitude,
        cuisine=room.cuisine,
        budget=room.budget,
    )

    restaurants = []
    for r_data in restaurants_data:
        restaurant = Restaurant.objects.create(room=room, **r_data)
        restaurants.append(restaurant)

    return Response(RestaurantSerializer(restaurants, many=True).data)


@api_view(["POST"])
def cast_vote(request, code):
    """Cast a vote (upvote/downvote) on a restaurant."""
    try:
        room = Room.objects.get(code=code.upper())
    except Room.DoesNotExist:
        return Response({"error": "Room not found."}, status=status.HTTP_404_NOT_FOUND)

    participant_id = request.data.get("participant_id")
    restaurant_id = request.data.get("restaurant_id")
    is_upvote = request.data.get("is_upvote", True)

    try:
        participant = Participant.objects.get(id=participant_id, room=room)
        restaurant = Restaurant.objects.get(id=restaurant_id, room=room)
    except (Participant.DoesNotExist, Restaurant.DoesNotExist):
        return Response({"error": "Invalid participant or restaurant."}, status=status.HTTP_400_BAD_REQUEST)

    vote, created = Vote.objects.update_or_create(
        participant=participant,
        restaurant=restaurant,
        defaults={"is_upvote": is_upvote},
    )

    # Return updated restaurant with new vote count
    return Response(RestaurantSerializer(restaurant).data)


@api_view(["POST"])
def spin_wheel(request, code):
    """Spin the wheel! Pick a random restaurant, weighted by votes."""
    try:
        room = Room.objects.get(code=code.upper())
    except Room.DoesNotExist:
        return Response({"error": "Room not found."}, status=status.HTTP_404_NOT_FOUND)

    restaurants = list(room.restaurants.all())
    if not restaurants:
        return Response(
            {"error": "No restaurants loaded. Fetch restaurants first."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Weight by votes: more upvotes = higher chance
    weights = []
    for r in restaurants:
        upvotes = r.votes.filter(is_upvote=True).count()
        downvotes = r.votes.filter(is_upvote=False).count()
        # Minimum weight of 1 so every restaurant has a chance
        weight = max(1, 3 + (upvotes - downvotes))
        weights.append(weight)

    winner = random.choices(restaurants, weights=weights, k=1)[0]

    spin_result = SpinResult.objects.create(room=room, restaurant=winner)

    return Response({
        "spin_result": SpinResultSerializer(spin_result).data,
        "all_restaurants": RestaurantSerializer(restaurants, many=True).data,
    })