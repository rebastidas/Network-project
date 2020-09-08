from django.urls import path

from . import views

urlpatterns = [

    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    
    #App_Features:
    path("addpost", views.add_post, name="add_post"),
    path("follow_unfollow", views.follow_unfollow, name="follow_unfollow"),
    path("like", views.like_post, name="like_post"),
    path("loadposts/<int:page>",views.load_posts, name="load_posts"),
    path("f/<str:following>", views.following, name="following"),
    path("follow_posts/posts/<int:page>", views.follow_posts, name="follow_posts"),
    path("<str:profile>/posts/<int:page>", views.profile_posts, name="profile_posts"),
    path("<str:profile>", views.profile, name="profile"),
]
