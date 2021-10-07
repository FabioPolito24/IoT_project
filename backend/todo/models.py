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

class Survey(models.Model):
    startDate = models.DateField(null=True)
    title = models.CharField(null=True, max_length=120)
    description = models.TextField(null=True)
    code = models.CharField(null=True, max_length=10)
    status = models.CharField(max_length=10, choices=(('draft', 'Draft'), ('published', 'Published')))
    visibility = models.CharField(max_length=10, choices=(('public', 'Public'), ('private', 'Private')))
    createdBy = models.ForeignKey(User, on_delete=models.CASCADE)


class Question(models.Model):
    question = models.CharField(max_length=120, null=True)
    type = models.CharField(max_length=10, choices=(('open', 'Open'), ('choice', 'Choice')))
    index = models.IntegerField()
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE)


class Answer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    answer = models.CharField(max_length=120)


class Submission(models.Model):
    date = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE)


class SubmittedAnswer(models.Model):
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE)
    submission = models.ForeignKey(Submission, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    answer = models.CharField(max_length=120)
