from django.contrib import admin
from .models import User, Survey, Question, Answer, Submission, SubmittedAnswer


class UserAdmin(admin.ModelAdmin):
  list_display = ('id', 'username', 'password')

class SurveyAdmin(admin.ModelAdmin):
  list_display = ('id', 'startDate', 'title', 'code', 'status', 'visibility', 'description', 'createdBy')

class QuestionAdmin(admin.ModelAdmin):
  list_display = ('id', 'question', 'type', 'survey', 'index')

class AnswerAdmin(admin.ModelAdmin):
  list_display = ('id', 'question', 'answer')

class SubmissionAdmin(admin.ModelAdmin):
  list_display = ('id', 'survey', 'user', 'date')

class SubmittedAnswerAdmin(admin.ModelAdmin):
  list_display = ('id', 'survey', 'question', 'answer')


# Register your models here.
admin.site.register(User, UserAdmin)
admin.site.register(Survey, SurveyAdmin)
admin.site.register(Question, QuestionAdmin)
admin.site.register(Answer, AnswerAdmin)
admin.site.register(Submission, SubmissionAdmin)
admin.site.register(SubmittedAnswer, SubmittedAnswerAdmin)
