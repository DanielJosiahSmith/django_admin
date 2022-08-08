from django.db import models

class ImageList(models.Model):
    name = models.CharField(max_length=255)


class Image(models.Model):
    image_id = models.ForeignKey(ImageList, on_delete=models.CASCADE)
    image = models.ImageField()
