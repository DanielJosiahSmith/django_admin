# Generated by Django 4.1 on 2022-08-08 20:27

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('mf_app', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='person',
            name='image',
        ),
        migrations.DeleteModel(
            name='Image',
        ),
        migrations.DeleteModel(
            name='Person',
        ),
    ]
