from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    WatchVideosView,
    WatchVideoDetailView,
    VideoStreamView,
)
urlpatterns = [
    path("register/", views.register, name="register"),
    path("login/", views.login, name="login"),
    path("dashboard/", views.dashboard, name="dashboard"),
    path("create_video/", views.create_video, name="create_video"),

    path(
        "token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh"
    ),
     path(
        "watch-videos/",
        WatchVideosView.as_view(),
        name="watch-videos"
    ),
     
   path(
        "watch-videos/<int:pk>/",
        WatchVideoDetailView.as_view(),
        name="watch-video-detail"
    ),
   
    path(
        "watch-videos/<int:pk>/stream/",
        VideoStreamView.as_view(),
        name="video-stream"
    ),
    path("delete/<int:video_id>", views.delete_video, name="delete"),
    path("forget_password/", views.forget_password, name="forget_password"),
    path("reset_password/", views.reset_password, name="reset_password"),
] 
