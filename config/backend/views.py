from rest_framework.decorators import api_view, authentication_classes, permission_classes,parser_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated,IsAdminUser
from .serializers import LoginSerializers,CreateVideoSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from .models import  CreateVideo
from django.contrib.auth.models import User
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode,urlsafe_base64_decode
from django.utils.encoding import force_bytes,force_str
from django.core.mail import send_mail,EmailMultiAlternatives
from django.template.loader import render_to_string
from django.contrib.auth import get_user_model
from rest_framework.permissions import AllowAny
User = get_user_model()


    
    
    
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
@permission_classes([AllowAny])
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
                'username':user.username,
                'email':user.email,
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
    
    
    
    
from django.shortcuts import get_object_or_404
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import CreateVideo


from django.shortcuts import get_object_or_404
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import CreateVideo


@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def check_video_file(request, pk):
    video = get_object_or_404(
        CreateVideo,
        pk=pk,
        user=request.user,
    )

    file_exists = (
        video.video.storage.exists(video.video.name)
        if video.video else False
    )

    return Response({
        "id": video.id,
        "title": video.title,
        "file_exists": file_exists,
        "file_name": video.video.name if video.video else None,
    })