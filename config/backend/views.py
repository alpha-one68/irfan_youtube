from rest_framework.decorators import api_view, authentication_classes, permission_classes,parser_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import RegisterSerializers,LoginSerializers,CreateVideoSerializer, ResetPasswordSerializers
from rest_framework.parsers import MultiPartParser, FormParser
from .models import AddUser, CreateVideo
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode,urlsafe_base64_decode
from django.utils.encoding import force_bytes,force_str
from django.core.mail import send_mail,EmailMultiAlternatives
from django.template.loader import render_to_string
from django.contrib.auth import get_user_model

User = get_user_model()


@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def register(request):

    serializer = RegisterSerializers(data=request.data)

    if serializer.is_valid():
        serializer.save()

        return Response(
            {
                "message": "Successfully registered"
            },
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )
    
    
    
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes
)

from rest_framework.response import Response
from rest_framework import status

from rest_framework_simplejwt.tokens import RefreshToken



@api_view(['POST'])

@authentication_classes([])
@permission_classes([])
def login(request):
    serializers=LoginSerializers(data=request.data)
    if serializers.is_valid():
        user=serializers.validated_data['user']
        refresh=RefreshToken.for_user(user)
        return Response({
            'access':str(refresh.access_token),
            'message':'login successfully',
            'refresh':str(refresh),
            'user':{
                'id':user.id,
                'name':user.name,
                'username':user.username,
                'email':user.email,
                'dob':user.dob
            }
            
        },status=status.HTTP_200_OK)
        
    return Response(serializers.errors,status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard(request):
    user=request.user
    return Response({
        'message':'you are in a dashboard',
        'id':user.id,
        'username':user.username,
        'email':user.email,
        'dob':user.dob,
    },status=status.HTTP_200_OK)
    
    
    
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser,FormParser])
def create_video(request):
    serializers=CreateVideoSerializer(data=request.data)
    if serializers.is_valid():
        video=serializers.save(user=request.user)
        return Response(CreateVideoSerializer(video).data,status=status.HTTP_201_CREATED)
    
    return Response(serializers.errors,status=status.HTTP_400_BAD_REQUEST)







class WatchVideosView(APIView):
    permission_classes=[IsAuthenticated]
    
    def get(self,request):
        video=CreateVideo.objects.all().order_by('created_at')
        serializers=CreateVideoSerializer(video,many=True,context={'request':request})
        return Response(serializers.data)
    
    
    
from django.shortcuts import get_object_or_404


class WatchVideoDetailView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request, pk):

        video = get_object_or_404(
            CreateVideo,
            pk=pk
        )

        serializer = CreateVideoSerializer(
            video,
            context={
                "request": request
            }
        )

        return Response(
            serializer.data
        )
        
        
        
import os

from django.http import StreamingHttpResponse, Http404
from django.shortcuts import get_object_or_404
from django.conf import settings

from rest_framework.views import APIView

from .models import CreateVideo


class VideoStreamView(APIView):

    def get(self, request, pk):

        video = get_object_or_404(CreateVideo, pk=pk)

        if not video.video:
            raise Http404("Video not found")

        file_path = video.video.path

        if not os.path.exists(file_path):
            raise Http404("Video file does not exist")

        file_size = os.path.getsize(file_path)

        range_header = request.headers.get("Range")

        # Browser is requesting a specific part of the video
        if range_header:

            try:
                range_value = range_header.replace("bytes=", "")
                start, end = range_value.split("-")

                start = int(start)

                if end:
                    end = int(end)
                else:
                    end = file_size - 1

            except (ValueError, TypeError):
                return StreamingHttpResponse(
                    status=416,
                    headers={
                        "Content-Range": f"bytes */{file_size}"
                    }
                )

            if start >= file_size:
                return StreamingHttpResponse(
                    status=416,
                    headers={
                        "Content-Range": f"bytes */{file_size}"
                    }
                )

            end = min(end, file_size - 1)

            content_length = end - start + 1

            def file_iterator():

                with open(file_path, "rb") as video_file:

                    video_file.seek(start)

                    remaining = content_length

                    while remaining > 0:

                        chunk_size = min(1024 * 1024, remaining)

                        chunk = video_file.read(chunk_size)

                        if not chunk:
                            break

                        remaining -= len(chunk)

                        yield chunk

            response = StreamingHttpResponse(
                file_iterator(),
                status=206,
                content_type="video/mp4"
            )

            response["Content-Length"] = str(content_length)

            response["Content-Range"] = (
                f"bytes {start}-{end}/{file_size}"
            )

            response["Accept-Ranges"] = "bytes"

            return response

        # First request: send the beginning of the video
        def file_iterator():

            with open(file_path, "rb") as video_file:

                while True:

                    chunk = video_file.read(1024 * 1024)

                    if not chunk:
                        break

                    yield chunk

        response = StreamingHttpResponse(
            file_iterator(),
            content_type="video/mp4"
        )

        response["Content-Length"] = str(file_size)
        response["Accept-Ranges"] = "bytes"

        return response
    
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import CreateVideo


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_video(request, video_id):

    try:
        video = CreateVideo.objects.get(
            id=video_id,
            user=request.user
        )
    except CreateVideo.DoesNotExist:
        return Response(
            {
                "error": "Video not found or you are not the owner."
            },
            status=status.HTTP_404_NOT_FOUND
        )

    # Save the file path before deleting the database object
    file_path = None

    if video.video:
        file_path = video.video.path

    # Delete database record first
    video.delete()

    # Try to remove the physical video file
    if file_path:
        import os

        try:
            if os.path.exists(file_path):
                os.remove(file_path)

        except PermissionError:
            # The browser may still be streaming the file.
            # Database record is already deleted.
            pass

    return Response(
        {
            "message": "Video deleted successfully"
        },
        status=status.HTTP_200_OK
    )
    
    
    
    
@api_view(['POST'])
def forget_password(request):
    email=request.data.get('email')
    if email is None:
        return Response({'message':'email is requied'},status=status.HTTP_400_BAD_REQUEST)
    
    
    user=User.objects.filter(email__iexact=email).first()
    if user:
        uid=urlsafe_base64_encode(force_bytes(user.pk))
        token=default_token_generator.make_token(user)
        reset_link=(f"http://localhost:5173/reset-password/{uid}/{token}/")
        subject="reset password verification"
        html_message=render_to_string("email/forget_password.html",
                                      {
                                          "user":request.user,
                                          'reset_link':reset_link
                                      })
        email_message=EmailMultiAlternatives(subject=subject,body="click the link to reset_password",to=[user.email])
        email_message.attach_alternative(html_message,'text/html')
        email_message.send()
        return Response({'email has been sent'},status=status.HTTP_200_OK)
    return Response(
        {
            "message": (
                "If an account exists with this email, "
                "a password reset link has been sent."
            )
        },
        status=status.HTTP_200_OK
    )
    
    
@api_view(["POST"])
def reset_password(request):

    serializers=ResetPasswordSerializers(data=request.data)
    if serializers.is_valid():
        uid=serializers.validated_data['uid']
        token=serializers.validated_data['token']
        password=serializers.validated_data['password']
        try:
            user_id=force_str(urlsafe_base64_decode(uid))
            user=AddUser.objects.get(pk=user_id)
        except(OverflowError,ValueError,TypeError,AddUser.DoesNotExist):
            return Response({'detail':'link is expired'},status=status.HTTP_400_BAD_REQUEST)
        if not default_token_generator.check_token(user,token):
             return Response({'detail':'invalid link'},status=status.HTTP_400_BAD_REQUEST)
        user.set_password(password)
        user.save()
        return Response({"message":'successfully changed'},status=status.HTTP_200_OK)     
    else:
        return Response(serializers.errors,status=status.HTTP_400_BAD_REQUEST)
        