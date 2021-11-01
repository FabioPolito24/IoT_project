from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from todo import views

router = routers.DefaultRouter()
router.register(r'users', views.UserView, 'user')
router.register(r'measurements', views.MeasurementView, 'measurements')
router.register(r'tags', views.TagView, 'tag')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/login/', views.LoginView),
    path('api/predict/', views.PredictView),
    path('api/test/', views.TestView),
    path('api/testdelete/', views.TestDeleteView)
]
