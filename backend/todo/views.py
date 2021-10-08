from django.shortcuts import render
from django.views.generic.base import View
from rest_framework import viewsets
from django.http import HttpResponse, JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q
from .serializers import UserSerializer, MeasurementSerializer, TagSerializer
from .models import User, Measurement, Tag
import json
import random
import string


class UserView(viewsets.ModelViewSet):
  serializer_class = UserSerializer
  queryset = User.objects.all()

class TagView(viewsets.ModelViewSet):
  serializer_class = TagSerializer
  queryset = Tag.objects.all()

  def get_queryset(self):
    queryset = Tag.objects.all()
    limit = 50
    for name, value in self.request.query_params.items():
      if name == "limit":
        limit = int(value)
      else:
        queryset = queryset.filter(**{name: value})

    return queryset[:limit]

class MeasurementView(viewsets.ModelViewSet):
  serializer_class = MeasurementSerializer
  queryset = Measurement.objects.all()

  def get_queryset(self):
    queryset = Measurement.objects.all()
    limit = 2016
    for name, value in self.request.query_params.items():
      if name == "limit":
        limit = int(value)
      else:
        queryset = queryset.filter(**{name: value})

    return queryset[:limit]
'''
class SurveyView(viewsets.ModelViewSet):
  serializer_class = SurveySerializer

  def get_queryset(self):
    queryset = Survey.objects.all()

    for name, value in self.request.query_params.items():
      if name != 'search':
        queryset = queryset.filter(**{name: value})

    if 'search' in self.request.query_params:
      value = self.request.query_params['search']
      queryset = queryset.filter(Q(title__contains=value) | Q(description__contains=value) | Q(code=value.upper()))


    return queryset
'''


def TestView(request):
  path = "C:/Users/Salvatore/Downloads/glucose_sensor_refined_data.csv"
  user = User.objects.get(pk=1)
  f = open(path, "rt").read()
  rows = f.split("\n")[1:]
  print(len(rows))
  #for i in range(0, len(rows), 5000):

  Measurement.objects.bulk_create([Measurement(**{'date':row.split(",")[1].replace("/", "-"),
                                          'time': row.split(",")[2],
                                          'value': int(float(row.split(",")[3])),
                                          'type': 'G',
                                          'user': user})
                               for row in rows[120000:126530]])

  return JsonResponse({"success": True})


@require_http_methods(["POST"])
@csrf_exempt
def LoginView(request):
  data = json.loads(request.body)
  username = data.get("username", "")
  password = data.get("password", "")
  result = User.objects.filter(username=username).filter(password=password)

  if result:
    token = ''.join(random.SystemRandom().choice(string.ascii_uppercase + string.digits) for _ in range(20))
    return JsonResponse({'token': token, 'userId': result[0].id})
  else:
    return JsonResponse({})

