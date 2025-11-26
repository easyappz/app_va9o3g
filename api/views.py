from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from api.models import Member, AuthToken, Message
from api.serializers import (
    RegisterSerializer,
    LoginSerializer,
    MemberSerializer,
    UpdateProfileSerializer,
    MessageSerializer,
    CreateMessageSerializer
)
from api.authentication import TokenAuthentication


class RegisterView(APIView):
    """
    Register a new user account
    """
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            member = serializer.save()
            return Response(
                {
                    'id': member.id,
                    'username': member.username,
                    'message': 'User successfully registered'
                },
                status=status.HTTP_201_CREATED
            )
        return Response({'error': str(serializer.errors)}, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    Authenticate user and return token
    """
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            
            try:
                member = Member.objects.get(username=username)
                if member.check_password(password):
                    # Delete old tokens for this member
                    AuthToken.objects.filter(member=member).delete()
                    # Create new token
                    token = AuthToken.objects.create(member=member)
                    return Response(
                        {
                            'token': token.key,
                            'id': member.id,
                            'username': member.username
                        },
                        status=status.HTTP_200_OK
                    )
                else:
                    return Response(
                        {'error': 'Invalid credentials'},
                        status=status.HTTP_401_UNAUTHORIZED
                    )
            except Member.DoesNotExist:
                return Response(
                    {'error': 'Invalid credentials'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        return Response({'error': str(serializer.errors)}, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """
    Logout user and invalidate token
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Delete the current token
        AuthToken.objects.filter(member=request.user).delete()
        return Response(
            {'message': 'Successfully logged out'},
            status=status.HTTP_200_OK
        )


class ProfileView(APIView):
    """
    Get or update user profile
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = MemberSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        serializer = UpdateProfileSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            member = request.user
            
            # Update username if provided
            if 'username' in serializer.validated_data:
                member.username = serializer.validated_data['username']
            
            # Update password if provided
            if 'password' in serializer.validated_data:
                member.set_password(serializer.validated_data['password'])
            
            member.save()
            
            response_serializer = MemberSerializer(member)
            return Response(response_serializer.data, status=status.HTTP_200_OK)
        
        return Response({'error': str(serializer.errors)}, status=status.HTTP_400_BAD_REQUEST)


class MessageListCreateView(APIView):
    """
    Get message history or send a new message
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        limit = int(request.query_params.get('limit', 100))
        offset = int(request.query_params.get('offset', 0))
        
        # Validate limit and offset
        if limit < 1 or limit > 1000:
            limit = 100
        if offset < 0:
            offset = 0
        
        # Get messages with pagination
        total = Message.objects.count()
        messages = Message.objects.all()[offset:offset + limit]
        
        serializer = MessageSerializer(messages, many=True)
        return Response(
            {
                'messages': serializer.data,
                'total': total
            },
            status=status.HTTP_200_OK
        )

    def post(self, request):
        serializer = CreateMessageSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            message = serializer.save()
            response_serializer = MessageSerializer(message)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
        return Response({'error': str(serializer.errors)}, status=status.HTTP_400_BAD_REQUEST)
