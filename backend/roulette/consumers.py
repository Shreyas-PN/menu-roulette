import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Room, Participant, Restaurant, Vote
from .serializers import RestaurantSerializer


class VotingRoomConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_code = self.scope["url_route"]["kwargs"]["code"]
        self.room_group_name = f"room_{self.room_code}"

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name, self.channel_name
        )
        await self.accept()

        # Send current state to the new connection
        restaurants = await self.get_restaurants()
        participants = await self.get_participants()
        await self.send(text_data=json.dumps({
            "type": "room_state",
            "restaurants": restaurants,
            "participants": participants,
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name, self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        msg_type = data.get("type")

        if msg_type == "vote":
            restaurant = await self.process_vote(
                data["participant_id"],
                data["restaurant_id"],
                data["is_upvote"],
            )
            if restaurant:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "vote_update",
                        "restaurant": restaurant,
                        "voter": data.get("nickname", "Someone"),
                    },
                )

        elif msg_type == "spin_result":
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "spin_broadcast",
                    "winner_id": data["winner_id"],
                    "winner_name": data["winner_name"],
                },
            )

        elif msg_type == "participant_joined":
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "participant_broadcast",
                    "nickname": data["nickname"],
                },
            )

    async def vote_update(self, event):
        await self.send(text_data=json.dumps({
            "type": "vote_update",
            "restaurant": event["restaurant"],
            "voter": event["voter"],
        }))

    async def spin_broadcast(self, event):
        await self.send(text_data=json.dumps({
            "type": "spin_result",
            "winner_id": event["winner_id"],
            "winner_name": event["winner_name"],
        }))

    async def participant_broadcast(self, event):
        await self.send(text_data=json.dumps({
            "type": "participant_joined",
            "nickname": event["nickname"],
        }))

    @database_sync_to_async
    def get_restaurants(self):
        try:
            room = Room.objects.get(code=self.room_code.upper())
            restaurants = room.restaurants.all()
            return RestaurantSerializer(restaurants, many=True).data
        except Room.DoesNotExist:
            return []

    @database_sync_to_async
    def get_participants(self):
        try:
            room = Room.objects.get(code=self.room_code.upper())
            return [
                {"id": str(p.id), "nickname": p.nickname, "is_host": p.is_host}
                for p in room.participants.all()
            ]
        except Room.DoesNotExist:
            return []

    @database_sync_to_async
    def process_vote(self, participant_id, restaurant_id, is_upvote):
        try:
            participant = Participant.objects.get(id=participant_id)
            restaurant = Restaurant.objects.get(id=restaurant_id)
            Vote.objects.update_or_create(
                participant=participant,
                restaurant=restaurant,
                defaults={"is_upvote": is_upvote},
            )
            return RestaurantSerializer(restaurant).data
        except (Participant.DoesNotExist, Restaurant.DoesNotExist):
            return None