from django.contrib import admin
from .models import Room, Participant, Restaurant, Vote, SpinResult

@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ("code", "cuisine", "budget", "is_active", "created_at")
    list_filter = ("is_active", "budget")

@admin.register(Participant)
class ParticipantAdmin(admin.ModelAdmin):
    list_display = ("nickname", "room", "is_host", "joined_at")

@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = ("name", "room", "rating", "cuisine_type")

@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = ("participant", "restaurant", "is_upvote")

@admin.register(SpinResult)
class SpinResultAdmin(admin.ModelAdmin):
    list_display = ("room", "restaurant", "spun_at")