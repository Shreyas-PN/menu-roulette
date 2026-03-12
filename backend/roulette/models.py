import uuid
import string
import random
from django.db import models


def generate_room_code():
    """Generate a 6-character room code like 'A3X9K2'."""
    chars = string.ascii_uppercase + string.digits
    return "".join(random.choices(chars, k=6))


class Room(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=6, unique=True, default=generate_room_code)
    created_at = models.DateTimeField(auto_now_add=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    budget = models.CharField(
        max_length=4,
        choices=[
            ("$", "Budget"),
            ("$$", "Mid-range"),
            ("$$$", "Upscale"),
            ("$$$$", "Fine dining"),
        ],
        default="$$",
    )
    cuisine = models.CharField(max_length=100, blank=True, default="")
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Room {self.code}"


class Participant(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name="participants")
    nickname = models.CharField(max_length=50)
    is_host = models.BooleanField(default=False)
    joined_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nickname} in {self.room.code}"


class Restaurant(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name="restaurants")
    place_id = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=500)
    rating = models.FloatField(null=True, blank=True)
    price_level = models.IntegerField(null=True, blank=True)
    photo_url = models.URLField(max_length=1000, blank=True, default="")
    cuisine_type = models.CharField(max_length=100, blank=True, default="")
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    def __str__(self):
        return self.name


class Vote(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    participant = models.ForeignKey(Participant, on_delete=models.CASCADE, related_name="votes")
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name="votes")
    is_upvote = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("participant", "restaurant")

    def __str__(self):
        vote_type = "upvote" if self.is_upvote else "downvote"
        return f"{self.participant.nickname} {vote_type} {self.restaurant.name}"


class SpinResult(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name="spin_results")
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    spun_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Spin: {self.restaurant.name} in {self.room.code}"