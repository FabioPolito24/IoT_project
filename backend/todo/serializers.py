from rest_framework import serializers
from .models import User, Survey, Question, Answer, Submission, SubmittedAnswer, Measurement
import string
import random


class UserSerializer(serializers.ModelSerializer):
  class Meta:
    model = User
    fields = ('id', 'username', 'password')


class MeasurementSerializer(serializers.ModelSerializer):
  class Meta:
    model = Measurement
    fields = ('id', 'date', 'time', 'type', 'value', 'user')


class SurveySerializer(serializers.ModelSerializer):

  class Meta:
    model = Survey
    fields = ('id', 'startDate', 'title', 'code', 'status', 'visibility', 'description', 'createdBy')

  def to_representation(self, instance):
    data = super(SurveySerializer, self).to_representation(instance)
    username = getattr(User.objects.get(pk=data.get('createdBy')), 'username')
    data['username'] = username
    return data

  def create(self, validated_data):
    codes = set([getattr(s, 'code') for s in Survey.objects.all()])
    code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

    while(code in codes):
      code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

    validated_data['code'] = code
    return Survey.objects.create(**validated_data)


class QuestionSerializer(serializers.ModelSerializer):
  class Meta:
    model = Question
    fields = ('id', 'question', 'type', 'survey', 'index')


class AnswerSerializer(serializers.ModelSerializer):
  class Meta:
    model = Answer
    fields = ('id', 'question', 'answer')


class SubmissionSerializer(serializers.ModelSerializer):
  class Meta:
    model = Submission
    fields = ('id', 'date', 'user', 'survey')

  def to_representation(self, instance):
    data = super(SubmissionSerializer, self).to_representation(instance)
    data.update({
      'username': getattr(User.objects.get(pk=data.get('user')), 'username'),
      'code': getattr(Survey.objects.get(pk=data.get('survey')), 'code'),
      'title': getattr(Survey.objects.get(pk=data.get('survey')), 'title')
    })
    return data

class SubmittedAnswerSerializer(serializers.ModelSerializer):
  class Meta:
    model = SubmittedAnswer
    fields = ('id', 'submission', 'question', 'answer', 'survey')
