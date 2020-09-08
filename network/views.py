import json
import math
from django.contrib.auth import authenticate, login, logout, user_logged_in
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django import forms
from django.views.decorators.csrf import csrf_exempt
from django.core import serializers
from django.core.paginator import Paginator, InvalidPage
from .models import User, Post, UserFollowing

def index(request):
    return render(request, "network/index.html")

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

@csrf_exempt
@login_required
def add_post(request):

    if request.method == "POST":
        #recieving data
        data = json.loads(request.body)
        #Get Data For Post
        body = data.get("body")
        author_id = request.user

        #Pass the info to db
        post = Post(
            body = body,
            author_id = author_id,
        )

        post.save()

        print(post)
        return JsonResponse({"message":"post published"}, status=200)
    
    if request.method == "PUT":
        author = request.user
        data = json.loads(request.body)
        post_id = data.get("post_id")
        post = Post.objects.get(pk = post_id)

        if author == post.author_id:
            post.body = data.get("body")
            post.save()
            return JsonResponse({"message":"post updated","body":post_id}, status=200)
        
        else:
            return JsonResponse({"message":"Method not authorazide"}, status=401)
        
    else:
        return JsonResponse({"message":"Method not authorazide"}, status=401)

def load_posts(request,page):
    
    user = request.user
    #Request All Posts
    posts = Post.objects.all()
    #Posts in Chronological Order
    posts = posts.order_by("-time_stamp").all()
    ########################PAGINATION################################

    paginator = Paginator(list(post.serialize() for post in posts), 10)
    page = page
    try:
        current_page = paginator.page(page)
    except InvalidPage as e:
        page = int(page) if page.isdigit() else page
        context = {
            'page_number': page,
            'message': "Error"
        }
        return JsonResponse(context, status=404)

    context = {
        'posts': list(current_page),
        'current': page,
        'pages': math.ceil(paginator.count/10),
        'user':user.username,
        'userint':user.id
    }

    ##########################RESPONSE################################
    return JsonResponse (context, safe=False)

def profile(request, profile):

    users = User.objects.filter(username=profile).all()
    user = [user.serialize() for user in users]
    follow = User.objects.get(username=profile)
    followers = UserFollowing.objects.filter(user_follows = follow).count()
    following = UserFollowing.objects.filter(user_followers = follow).count()

    context = {
        "user":user,
        "followers":followers,
        "following":following
    }
    return JsonResponse (context, safe=False)

def profile_posts(request, profile, page):

    usr_id = User.objects.get(username=profile)
    posts = Post.objects.filter(author_id = usr_id)
    user = request.user
    posts = posts.order_by("-time_stamp").all()
    ########################PAGINATION################################

    paginator = Paginator(list(post.serialize() for post in posts), 10)
    page = page
    try:
        current_page = paginator.page(page)
    except InvalidPage as e:
        page = int(page) if page.isdigit() else page
        context = {
            'page_number': page,
            'message': "Error"
        }
        return JsonResponse(context, status=404)
    context = {
        'posts': list(current_page),
        'current': page,
        'pages': math.ceil(paginator.count/10),
        'user':user.username,
        'userint':user.id
    }

    ##########################RESPONSE################################

    return JsonResponse (context, safe=False)

def following(request, following):

    #Get Usr following:
    followin = User.objects.get(username = following)
    follower = request.user
    
    #Check if the relation exists
    flusr = UserFollowing.objects.filter(user_follows = followin, user_followers = follower).exists()
    
    return JsonResponse({"flusr":flusr}, status=200)

@csrf_exempt
def follow_unfollow(request):

    #Get Usr following:
    data = json.loads(request.body)
    following = data.get("follow")
    user = User.objects.get(username = following)
    followers = request.user
    
    #Create(follow) or Delete(unfollow Relation)
    try:
        follow = UserFollowing.objects.create(user_follows = user, user_followers = followers)
        follow.save()
    except IntegrityError:
        UserFollowing.objects.filter(user_follows = user, user_followers = followers).delete()
        return JsonResponse({"message":" you unfollow "+following})
    
    return JsonResponse({"message":" you follow "+following}, status=200)


@login_required
def follow_posts(request, page): 
    
    user = request.user

    flw = UserFollowing.objects.filter(user_followers = user)
    posts = Post.objects.filter(author_id__in = [f.user_follows for f in flw])

    ########################PAGINATION################################

    paginator = Paginator(list(post.serialize() for post in posts), 10)
    page = page
    try:
        current_page = paginator.page(page)
    except InvalidPage as e:
        page = int(page) if page.isdigit() else page
        context = {
            'page_number': page,
            'message': "Error"
        }
        return JsonResponse(context, status=404)
    context = {
        'posts': list(current_page),
        'current': page,
        'pages': math.ceil(paginator.count/3),
        'user':user.username,
        'userint':user.id
    }

    ##########################RESPONSE################################

    return JsonResponse (context, safe=False)

@csrf_exempt
@login_required
def like_post(request):

    if request.method == "PUT":

        data = json.loads(request.body)
        user = request.user
        post_id = data.get("post_id")
        body = data.get("body")

        post = Post.objects.get(pk=post_id) 

        if user is not None:
            if user not in post.liked_by.all():
                post.liked_by.add(user)
                post.likes = post.likes + 1
                post.save()
                return JsonResponse({"message":"You liked this post"}, status=200)
            else:
                post.liked_by.remove(user)
                post.likes = post.likes - 1
                post.save()
                return JsonResponse({"message":"You unliked this post"}, status=200)
        else:
            return JsonResponse({"message":"Method not authorazide"}, status=401)
    else:
        return JsonResponse({"message":"Method not authorazide"}, status=401)