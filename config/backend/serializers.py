from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import AddUser
from django.contrib.auth import authenticate
from .models import CreateVideo
class RegisterSerializers(serializers.ModelSerializer):
        password=serializers.CharField(write_only=True,validators=[validate_password],min_length=8)
        confirm_password=serializers.CharField(write_only=True,min_length=8)
        
        
        class Meta:
            model=AddUser
            fields=['name','username','email','dob','password','confirm_password']
            
            
            
        def validate_email(self,value):
            value=value.lower()
            if AddUser.objects.filter(email__iexact=value).exists():
                raise serializers.ValidationError('This Email Already Exists')
            
            return value
        
        def validate_username(self,value):
            value=value.lower().strip()
            if AddUser.objects.filter(username__iexact=value).exists():
                raise serializers.ValidationError('The Username Already Exists')
            return value
        
        def validate(self,data):
            if data['password']and data['confirm_password']:
                if data['password']!=data['confirm_password']:
                    raise serializers.ValidationError("password doesnt same")
            return data
        
        
        def create(self,validate_data):
            validate_data.pop('confirm_password')
            user=AddUser.objects.create_user(
                        name=validate_data['name'],
                        email=validate_data['email'],
                        username=validate_data['username'],
                        dob=validate_data['dob'],
                        password=validate_data['password'])
            return user
        
        
        
class LoginSerializers(serializers.Serializer):
    username=serializers.CharField()
    password=serializers.CharField(write_only=True)
    
    
    
    
    def validate(self,data):
        username=data.get('username')
        password=data.get('password')
        
        
        if "@" in username:
            user_obj=AddUser.objects.filter(email__iexact=username).first()
            user=authenticate(username=user_obj,password=password)
            
        else:
            user=authenticate(username=username,password=password)
            
            
        if user is None:
            raise serializers.ValidationError('invalid username and password')
        
        
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
    
    
    
class ResetPasswordSerializers(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    password=serializers.CharField(write_only=True,min_length=8)
    confirm_password=serializers.CharField(write_only=True,min_length=8)
    
    
    
    def validate_password(self,value):
        validate_password(value)
        return value
    def validate(self,data):
        password=data['password']
        confirm_password=data['confirm_password']
        if password and confirm_password and password!=confirm_password:
            raise serializers.ValidationError('password does not match')
        
        return data