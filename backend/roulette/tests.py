import pytest
from django.test import TestCase
from rest_framework.test import APIClient
from .models import Room, Participant, Restaurant, Vote
from .services.ai_mood import CUISINE_OPTIONS


class RoomModelTest(TestCase):
    def test_room_code_generated(self):
        room = Room.objects.create(latitude=42.36, longitude=-71.06)
        self.assertEqual(len(room.code), 6)
        self.assertTrue(room.code.isalnum())

    def test_room_code_unique(self):
        codes = set()
        for _ in range(50):
            room = Room.objects.create(latitude=42.36, longitude=-71.06)
            codes.add(room.code)
        # All codes should be unique (astronomically unlikely to collide in 50)
        self.assertEqual(len(codes), 50)


class APITest(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_create_room(self):
        response = self.client.post("/api/rooms/", {
            "nickname": "Shreyas",
            "latitude": 42.36,
            "longitude": -71.06,
            "budget": "$$",
        }, format="json")
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertIn("room", data)
        self.assertIn("participant_id", data)
        self.assertEqual(len(data["room"]["code"]), 6)

    def test_join_room(self):
        # Create room first
        room = Room.objects.create(latitude=42.36, longitude=-71.06)
        Participant.objects.create(room=room, nickname="Host", is_host=True)

        response = self.client.post("/api/rooms/join/", {
            "nickname": "Friend",
            "code": room.code,
        }, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(room.participants.count(), 2)

    def test_join_nonexistent_room(self):
        response = self.client.post("/api/rooms/join/", {
            "nickname": "Lost",
            "code": "ZZZZZ9",
        }, format="json")
        self.assertEqual(response.status_code, 404)

    def test_get_room(self):
        room = Room.objects.create(latitude=42.36, longitude=-71.06)
        response = self.client.get(f"/api/rooms/{room.code}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["code"], room.code)

    def test_set_cuisine(self):
        room = Room.objects.create(latitude=42.36, longitude=-71.06)
        response = self.client.post(
            f"/api/rooms/{room.code}/cuisine/",
            {"cuisine": "Japanese"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        room.refresh_from_db()
        self.assertEqual(room.cuisine, "Japanese")

    def test_vote_and_weighted_spin(self):
        room = Room.objects.create(latitude=42.36, longitude=-71.06)
        participant = Participant.objects.create(room=room, nickname="Voter", is_host=True)
        r1 = Restaurant.objects.create(
            room=room, place_id="a", name="Loved Place",
            address="123 St", cuisine_type="Italian",
        )
        r2 = Restaurant.objects.create(
            room=room, place_id="b", name="Meh Place",
            address="456 St", cuisine_type="Thai",
        )

        # Upvote r1 a bunch
        Vote.objects.create(participant=participant, restaurant=r1, is_upvote=True)

        response = self.client.post(f"/api/rooms/{room.code}/spin/", format="json")
        self.assertEqual(response.status_code, 200)
        self.assertIn("spin_result", response.json())

    def test_cast_vote(self):
        room = Room.objects.create(latitude=42.36, longitude=-71.06)
        participant = Participant.objects.create(room=room, nickname="Voter", is_host=True)
        restaurant = Restaurant.objects.create(
            room=room, place_id="test", name="Test Spot",
            address="789 St", cuisine_type="Mexican",
        )

        response = self.client.post(f"/api/rooms/{room.code}/vote/", {
            "participant_id": str(participant.id),
            "restaurant_id": str(restaurant.id),
            "is_upvote": True,
        }, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["vote_count"], 1)


class CuisineOptionsTest(TestCase):
    def test_cuisine_list_not_empty(self):
        self.assertGreater(len(CUISINE_OPTIONS), 10)

    def test_all_cuisines_are_strings(self):
        for c in CUISINE_OPTIONS:
            self.assertIsInstance(c, str)