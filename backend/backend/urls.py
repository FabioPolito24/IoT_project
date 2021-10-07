from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from todo import views

router = routers.DefaultRouter()
router.register(r'users', views.UserView, 'user')
router.register(r'surveys', views.SurveyView, 'survey')
router.register(r'questions', views.QuestionView, 'question')
router.register(r'answers', views.AnswerView, 'answers')
router.register(r'submissions', views.SubmissionView, 'submissions')
router.register(r'submittedAnswers', views.SubmittedAnswerView, 'submittedAnswers')
router.register(r'measurements', views.MeasurementView, 'measurements')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/login/', views.LoginView),
    path('api/test/', views.TestView),
]
