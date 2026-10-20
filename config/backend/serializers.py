from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import CreateVideo
class LoginSerializers(serializers.Serializer):
    username=serializers.CharField()
    password=serializers.CharField(write_only=True)
    
    
    
    
    def validate(self,data):
        username=data.get('username')
        password=data.get('password')
        
        user=authenticate(username=username,password=password)
            
            
        if user is None:
            raise serializers.ValidationError('invalid username and password')
        
        if not user.is_superuser:
            raise serializers.ValidationError('only admin can login')
        
        
        data['user']=user
        
        return data


class CreateVideoSerializer(serializers.ModelSerializer):

    class Meta:
        model = CreateVideo
        fields = [
            "id",
            "title",
            "description",
            "video",
        ]
        read_only_fields = ["id"]

    def validate_video(self, value):

        if value and CreateVideo.objects.filter(video__endswith=value.name).exists():
            raise serializers.ValidationError({
                "video": "This video has already been uploaded."
            })

        return value
    
    
    def get_video_url(self, obj):

        request = self.context.get("request")

        url = f"/watch-videos/{obj.id}/stream/"

        if request:
            return request.build_absolute_uri(url)

        return url
    