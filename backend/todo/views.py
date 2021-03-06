from django.shortcuts import render
from django.views.generic.base import View
from rest_framework import viewsets
from django.http import HttpResponse, JsonResponse, QueryDict
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q
from .serializers import UserSerializer, MeasurementSerializer, TagSerializer
from .models import User, Measurement, Tag
import json
import random
import string
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA


class UserView(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    queryset = User.objects.all()


class TagView(viewsets.ModelViewSet):
    serializer_class = TagSerializer
    queryset = Tag.objects.all()

    def get_queryset(self):
        queryset = Tag.objects.all()
        limit = 50

        if 'tag' in self.request.query_params:
           tags = Tag.objects.filter(value__icontains=self.request.query_params['tag'])
           dates = [t.date for t in tags]
           queryset = queryset.filter(date__in=dates)
           return queryset[:limit]

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

        if 'tag' in self.request.query_params:
           tags = Tag.objects.filter(value__icontains=self.request.query_params['tag'])
           dates = [t.date for t in tags]
           queryset = queryset.filter(date__in=dates)
           return queryset[:limit]

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

def PredictView(request):
    query_params = request.GET
    queryset = Measurement.objects.all()

    for name, value in query_params.items():
        queryset = queryset.filter(**{name: value})
        
    if len(queryset) < 36:
        return JsonResponse({"measurements": [], "predictions": []})
        
    df = pd.DataFrame([{
        'ds': str(m.date) + ' ' + str(m.time),
        'y': m.value
    } for m in queryset])[::-1]
    
    df['ds'] = pd.to_datetime(df['ds'])
    df = df.set_index('ds')
    df.index = pd.DatetimeIndex(df.index).to_period('5T')
    
    model = ARIMA(df, order=(2,1,2))
    model_fit = model.fit()
    predictions = model_fit.forecast(12)
    
    measurements = [{
        'time': m.time,
        'value': m.value
    } for m in queryset][::-1]
    
    predictions = [{
        'time': str(index.to_timestamp())[11:],
        'value': int(value)
    } for index, value in predictions.items()]

    return JsonResponse({"measurements": measurements, "predictions": predictions})


def TestView(request):
    path = "C:/Users/Salvatore/Downloads/glucose_sensor_refined_data.csv"
    user = User.objects.get(pk=1)
    f = open(path, "rt").read()
    rows = f.split("\n")[1:]
    print(len(rows))
    # for i in range(0, len(rows), 5000):

    Measurement.objects.bulk_create([Measurement(**{'date': row.split(",")[1].replace("/", "-"),
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

@require_http_methods(["DELETE"])
@csrf_exempt
def TestDeleteView(request):
    data = request.GET
    total = Measurement.objects.filter(date=data["date"], type='G').delete()

    return JsonResponse({"success": True, "Date": data["date"], "Total": total[0]})
