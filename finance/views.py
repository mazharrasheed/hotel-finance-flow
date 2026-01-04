from django.shortcuts import render

# Create your views here.


from .models import Project,Transaction
from .serializers import ProjectSerializer,UserSignupSerializer,TransactionSerializer,UserSerializer

from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.decorators import action
from rest_framework.permissions import DjangoObjectPermissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView



from django.contrib.auth.models import User,Permission,Group
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import ProtectedError
import json



reset_tokens = {}  # simple in-memory store; use DB in production

@csrf_exempt
def forgot_password(request):
    if request.method == "POST":
        try:
            if request.content_type == "application/json":
                data = json.loads(request.body.decode("utf-8"))
            else:
                data = request.POST
            email = data.get("email")

            if not email:
                return JsonResponse({"error": "Email is required."}, status=400)
            
            print('reset_tokens')
            user = User.objects.get(email=email)
            token = get_random_string(32)
            reset_tokens[token] = user.username

            reset_link = f"{settings.FRONTEND_URL}/reset-password/{token}"
            send_mail(
                "Password Reset Request",
                f"Click here to reset your password: {reset_link}",
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            return JsonResponse({"message": "Password reset link sent to your email."})

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format."}, status=400)
        except User.DoesNotExist:
            return JsonResponse({"error": "Email not found."}, status=400)

    return JsonResponse({"error": "Invalid request method."}, status=400)

@csrf_exempt
def reset_password(request, token):
    if request.method == "POST":
        data = json.loads(request.body)
        new_password = data.get("new_password")
        username = reset_tokens.get(token)
        if not username:
            return JsonResponse({"error": "Invalid or expired token"}, status=400)
        user = User.objects.get(username=username)
        user.set_password(new_password)
        user.save()
        del reset_tokens[token]  # remove used token
        return JsonResponse({"message": "Password reset successful"})
    return JsonResponse({"error": "Invalid request"}, status=400)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        old_password = request.data.get("old_password")
        new_password1 = request.data.get("new_password1")
        new_password2 = request.data.get("new_password2")

        if not user.check_password(old_password):
            return Response(
                {"old_password": ["Old password is incorrect"]},
                status=status.HTTP_400_BAD_REQUEST
            )

        if new_password1 != new_password2:
            return Response(
                {"new_password2": ["Passwords do not match"]},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            validate_password(new_password1, user)
        except ValidationError as e:
            return Response(
                {"new_password2": e.messages},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password1)
        user.save()

        return Response(
            {"detail": "Password changed successfully"},
            status=status.HTTP_200_OK
        )


class UserProfileView(APIView):

    def get(self, request):
        users = User.objects.filter(username=request.user.username) 
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
    
class UserListView(APIView):
    def get(self, request):
        if request.user.is_superuser:
            users = User.objects.all() 
        else:
            users = User.objects.filter(username=request.user)
        serializer = UserSignupSerializer(users, many=True)
        return Response(serializer.data)
    
class UserSignupView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserSignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'message': 'User created successfully!',
                'token': token.key
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        users = self.get_queryset()
        serializer = self.get_serializer(users, many=True)
        return Response(serializer.data)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_permissions_view(request):
    user = request.user

    # -----------------------------
    # ✅ SUPERUSER: return ALL permissions
    # -----------------------------
    if user.is_superuser:
        perms = Permission.objects.select_related("content_type").all()

        permission_objects = [
            {
                "codename": perm.codename,
                "name": perm.name,
                "app_label": perm.content_type.app_label,
            }
            for perm in perms
        ]

        return Response({
            "username": user.username,
            "is_superuser": True,
            "permissions": permission_objects,
        })

    # -----------------------------
    # ✅ NORMAL USER: only assigned permissions
    # (filtered to finance app)
    # -----------------------------
    user_perms = user.get_all_permissions()  # {"app_label.codename"}
    permission_objects = []

    for perm in user_perms:
        app_label, codename = perm.split(".")

        # Only allow permissions from finance app
        if app_label != "finance":
            continue

        try:
            perm_obj = Permission.objects.get(
                codename=codename,
                content_type__app_label=app_label
            )
            permission_objects.append({
                "codename": perm_obj.codename,
                "name": perm_obj.name,
                "app_label": app_label,
            })
        except Permission.DoesNotExist:
            pass

    return Response({
        "username": user.username,
        "is_superuser": False,
        "permissions": permission_objects,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_groups(request):
    groups = Group.objects.all()
    data = [{"id": g.id, "name": g.name} for g in groups]
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    return Response({
        'id': request.user.id,
        'username': request.user.username,
        'is_superuser': request.user.is_superuser
    })


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response(
                {"detail": "Cannot delete project with existing transactions."},
                status=status.HTTP_400_BAD_REQUEST
            )

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer

    def get_queryset(self):
        # Allow filtering by project via URL: /api/transactions/?project_id=...
        queryset = Transaction.objects.all()
        project_id = self.request.query_params.get('project_id')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset