from rest_framework import serializers
from .models import User, Measurement, Tag


class UserSerializer(serializers.ModelSerializer):
  class Meta:
    model = User
    fields = ('id', 'username', 'password')


class MeasurementSerializer(serializers.ModelSerializer):
  class Meta:
    model = Measurement
    fields = ('id', 'date', 'time', 'type', 'value', 'user')


class TagSerializer(serializers.ModelSerializer):
  class Meta:
    model = Tag
    fields = ('id', 'date', 'time', 'value', 'user')


'''
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
'''
