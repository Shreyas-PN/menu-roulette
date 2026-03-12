from django.urls import path
from . import views

urlpatterns = [
    path("rooms/", views.create_room, name="create-room"),
    path("rooms/join/", views.join_room, name="join-room"),
    path("rooms/<str:code>/", views.get_room, name="get-room"),
    path("rooms/<str:code>/cuisine/", views.set_cuisine, name="set-cuisine"),
    path("rooms/<str:code>/restaurants/", views.fetch_restaurants, name="fetch-restaurants"),
    path("rooms/<str:code>/vote/", views.cast_vote, name="cast-vote"),
    path("rooms/<str:code>/spin/", views.spin_wheel, name="spin-wheel"),
    path("mood/", views.mood_to_cuisine, name="mood-to-cuisine"),
]