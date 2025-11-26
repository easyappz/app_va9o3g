import binascii
import os
from django.db import models
from django.contrib.auth.hashers import make_password, check_password


class Member(models.Model):
    """Custom user model for the application"""
    username = models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'member'
        ordering = ['-created_at']

    def __str__(self):
        return self.username

    def set_password(self, raw_password):
        """Hash and set the password"""
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        """Check if the provided password matches the stored hash"""
        return check_password(raw_password, self.password)

    @property
    def is_authenticated(self):
        """Always return True for authenticated members"""
        return True

    @property
    def is_anonymous(self):
        """Always return False for members"""
        return False

    def has_perm(self, perm, obj=None):
        """Required for DRF permission classes"""
        return True

    def has_module_perms(self, app_label):
        """Required for DRF permission classes"""
        return True


class AuthToken(models.Model):
    """Authentication token for members"""
    key = models.CharField(max_length=40, unique=True, primary_key=True)
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='auth_tokens')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'auth_token'
        ordering = ['-created_at']

    def __str__(self):
        return self.key

    def save(self, *args, **kwargs):
        if not self.key:
            self.key = self.generate_key()
        return super().save(*args, **kwargs)

    @classmethod
    def generate_key(cls):
        """Generate a random token key"""
        return binascii.hexlify(os.urandom(20)).decode()


class Message(models.Model):
    """Message model"""
    text = models.TextField()
    author = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='messages')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'message'
        ordering = ['-created_at']

    def __str__(self):
        return f"Message by {self.author.username}: {self.text[:50]}"
