from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):

    def serialize(self):
        return{
            "id":self.id,
            "username": self.username,
        }
        
class Post(models.Model):
    body = models.CharField (max_length = 240)
    likes = models.IntegerField(default=0)
    author_id = models.ForeignKey(User, on_delete=models.PROTECT)
    time_stamp = models.DateTimeField(auto_now_add=True)
    liked_by = models.ManyToManyField(User, related_name="usernames")


    def serialize(self):
        
        return{
            "id" : self.id,
            "author_username" : self.author_id.username,
            "body" : self.body,
            "time_stamp": self.time_stamp.strftime("%d-%b, %H:%M"),
            "likes": self.likes,
            "liked_by": list(Post.objects.filter(pk=self.id).values("liked_by"))
        }

class UserFollowing(models.Model):
    user_follows = models.ForeignKey(User, blank=False, related_name = "following", on_delete=models.CASCADE)
    user_followers = models.ForeignKey(User, blank = False, related_name = "followers", on_delete=models.CASCADE)

    class Meta:
        unique_together = [["user_follows","user_followers"]]
