# Generated by Django 3.1.3 on 2021-10-10 14:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('todo', '0005_auto_20211008_1750'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tag',
            name='value',
            field=models.CharField(max_length=120),
        ),
    ]
