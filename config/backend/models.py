from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
# Create your models here.


from django.contrib.auth.models import AbstractUser
from django.db import models


class AddUser(AbstractUser):
    name=models.CharField(max_length=30)
    email = models.EmailField(unique=True)
    dob = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.username
    
    
    
    
import uuid
from django.db import models
from django.conf import settings



class CreateVideo(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="videos"
    )

    title = models.CharField(max_length=200)
    description = models.TextField()
    video=models.FileField(upload_to='videos/')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title