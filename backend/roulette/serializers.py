from rest_framework import serializers
from .models import Room, Participant, Restaurant, Vote, SpinResult


class ParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Participant
        fields = ["id", "nickname", "is_host", "joined_at"]


class RestaurantSerializer(serializers.ModelSerializer):
    vote_count = serializers.SerializerMethodField()

    class Meta:
        model = Restaurant
        fields = [
            "id", "place_id", "name", "address", "rating",
            "price_level", "photo_url", "cuisine_type",
            "latitude", "longitude", "vote_count",
        ]

    def get_vote_count(self, obj):
        upvotes = obj.votes.filter(is_upvote=True).count()
        downvotes = obj.votes.filter(is_upvote=False).count()
        return upvotes - downvotes


class VoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vote
        fields = ["id", "participant", "restaurant", "is_upvote", "created_at"]


class SpinResultSerializer(serializers.ModelSerializer):
    restaurant = RestaurantSerializer()

    class Meta:
        model = SpinResult
        fields = ["id", "restaurant", "spun_at"]


class RoomSerializer(serializers.ModelSerializer):
    participants = ParticipantSerializer(many=True, read_only=True)
    restaurants = RestaurantSerializer(many=True, read_only=True)

    class Meta:
        model = Room
        fields = [
            "id", "code", "created_at", "latitude", "longitude",
            "budget", "cuisine", "is_active", "participants", "restaurants",
        ]


class CreateRoomSerializer(serializers.Serializer):
    nickname = serializers.CharField(max_length=50)
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()
    budget = serializers.ChoiceField(choices=["$", "$$", "$$$", "$$$$"])


class JoinRoomSerializer(serializers.Serializer):
    nickname = serializers.CharField(max_length=50)
    code = serializers.CharField(max_length=6)


class MoodSerializer(serializers.Serializer):
    mood = serializers.CharField(max_length=500)