from rest_framework import serializers
from api.models import Member, Message


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150, min_length=3)
    password = serializers.CharField(max_length=128, min_length=6, write_only=True)

    def validate_username(self, value):
        if Member.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value

    def create(self, validated_data):
        member = Member(username=validated_data['username'])
        member.set_password(validated_data['password'])
        member.save()
        return member


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(max_length=128, write_only=True)


class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = ['id', 'username', 'created_at']
        read_only_fields = ['id', 'created_at']


class UpdateProfileSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150, min_length=3, required=False)
    password = serializers.CharField(max_length=128, min_length=6, write_only=True, required=False)

    def validate_username(self, value):
        request = self.context.get('request')
        if request and request.user:
            if Member.objects.filter(username=value).exclude(id=request.user.id).exists():
                raise serializers.ValidationError("Username already exists")
        return value


class MessageSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'username', 'text', 'created_at']
        read_only_fields = ['id', 'username', 'created_at']

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class CreateMessageSerializer(serializers.Serializer):
    text = serializers.CharField(max_length=5000, min_length=1)

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return Message.objects.create(**validated_data)
