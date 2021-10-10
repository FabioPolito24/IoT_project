from django.db import models
from django.utils import timezone

class User(models.Model):
    username = models.CharField(max_length=120)
    password = models.CharField(max_length=120)

    def __str__(self):
        return self.username

class Measurement(models.Model):
    date = models.DateField()
    time = models.TimeField()
    value = models.IntegerField()
    type = models.CharField(max_length=1, choices=(('G', 'Glucose'), ('H', 'Heartbeat')))
    user = models.ForeignKey(User, on_delete=models.CASCADE)

class Tag(models.Model):
    date = models.DateField()
    time = models.TimeField()
    value = models.CharField(max_length=120)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
