# Generated by Django 3.1.3 on 2021-10-01 13:45

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('todo', '0003_auto_20210313_1001'),
    ]

    operations = [
        migrations.CreateModel(
            name='Measurement',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('time', models.TimeField()),
                ('value', models.IntegerField()),
                ('type', models.CharField(choices=[('G', 'Glucose'), ('H', 'Heartbeat')], max_length=1)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='todo.user')),
            ],
        ),
    ]
