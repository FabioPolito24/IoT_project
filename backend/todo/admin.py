from django.contrib import admin
from .models import User, Measurement, Tag


class UserAdmin(admin.ModelAdmin):
  list_display = ('id', 'username', 'password')

class MeasurementAdmin(admin.ModelAdmin):
  list_display = ('id', 'user', 'value', 'type', 'date', 'time')

class TagAdmin(admin.ModelAdmin):
  list_display = ('id', 'user', 'value', 'date', 'time')


# Register your models here.
admin.site.register(User, UserAdmin)
admin.site.register(Measurement, MeasurementAdmin)
admin.site.register(Tag, TagAdmin)
