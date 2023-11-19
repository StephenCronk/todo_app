from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.
class User(AbstractUser):
    pass

# server will provide all Tasks on the current date for a given user
# user can add a new task, which will be added to the current date
# if repeats, the server will make a new one for the next date on complete
# deletes when user deletes it or when over 31d old
class Task(models.Model):
    task = models.CharField(max_length=64)
    date = models.DateTimeField(auto_now_add=True)
    repeats = models.BooleanField(default=False)
    completed = models.BooleanField(default=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tasks")
    index = models.IntegerField(default=0)
    id = models.AutoField(primary_key=True)
    def __str__(self):
        return f"{self.task} - {self.user}"

class Hero(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="heroes")
    level = models.IntegerField(default=1)
    def __str__(self):
        return self.name
