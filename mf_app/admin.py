from django.contrib import admin
from .models import Image,ImageList

class ImageInline(admin.TabularInline):
    model = Image

class ImageListAdmin(admin.ModelAdmin):
    inlines = [ImageInline]

    class Media:
        js = ('test.js',)

admin.site.register(ImageList,ImageListAdmin)


