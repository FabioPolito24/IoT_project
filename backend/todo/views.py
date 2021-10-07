from django.shortcuts import render
from django.views.generic.base import View
from rest_framework import viewsets
from django.http import HttpResponse, JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q
from .serializers import UserSerializer, SurveySerializer, QuestionSerializer,\
  AnswerSerializer, SubmissionSerializer, SubmittedAnswerSerializer, MeasurementSerializer
from .models import User, Survey, Question, Answer, SubmittedAnswer, Submission, Measurement
import json
import random
import string


class UserView(viewsets.ModelViewSet):
  serializer_class = UserSerializer
  queryset = User.objects.all()

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

class QuestionView(viewsets.ModelViewSet):
  serializer_class = QuestionSerializer

  def get_queryset(self):
    if self.request.query_params.get("survey"):
      if self.request.query_params.get("survey").isdigit():
        survey = int(self.request.query_params.get("survey"))
      else:
        survey = 0
      queryset = Question.objects.filter(survey=survey)

    elif self.request.query_params.get("user"):
      surveys = Survey.objects.filter(createdBy=int(self.request.query_params.get("user")))
      surveys = [getattr(s, 'id') for s in surveys]
      queryset = Question.objects.filter(survey__in=surveys)
    else:
      queryset = Question.objects.all()

    return queryset

class AnswerView(viewsets.ModelViewSet):
  serializer_class = AnswerSerializer

  def get_queryset(self):
    if self.request.query_params.get("question"):
      if self.request.query_params.get("question").isdigit():
        question = int(self.request.query_params.get("question"))
      else:
        question = 0
      queryset = Answer.objects.filter(question=question)
    else:
      queryset = Answer.objects.all()
    return queryset


class SubmissionView(viewsets.ModelViewSet):
  serializer_class = SubmissionSerializer
  queryset = Submission.objects.all()

  def get_queryset(self):
    queryset = Submission.objects.all()

    for name, value in self.request.query_params.items():
        queryset = queryset.filter(**{name: value})

    return queryset


class SubmittedAnswerView(viewsets.ModelViewSet):
  serializer_class = SubmittedAnswerSerializer
  queryset = SubmittedAnswer.objects.all()

  def get_queryset(self):
    queryset = SubmittedAnswer.objects.all()

    if 'user' not in self.request.query_params:
        for name, value in self.request.query_params.items():
            queryset = queryset.filter(**{name: value})

    else:
        surveys = Survey.objects.filter(createdBy=int(self.request.query_params.get("user")))
        surveys = [getattr(s, 'id') for s in surveys]
        queryset = SubmittedAnswer.objects.filter(survey__in=surveys)

    return queryset


def TestView(request):
  path = "C:/Users/Salvatore/Downloads/glucose_sensor_refined_data.csv"
  user = User.objects.get(pk=1)
  f = open(path, "rt").read()
  Measurement.objects.bulk_create([Measurement(**{'date':row.split(",")[1].replace("/", "-"),
                                          'time': row.split(",")[2],
                                          'value': int(float(row.split(",")[3])),
                                          'type': 'G',
                                          'user': user})
                               for row in f.split("\n")[34680:58464]])

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

