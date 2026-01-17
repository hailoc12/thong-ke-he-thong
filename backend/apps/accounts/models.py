from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Extended User model with role-based access control"""

    ROLE_CHOICES = [
        ('admin', 'Administrator'),
        ('org_user', 'Organization User'),
    ]

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='org_user',
        help_text='User role: admin can see all data, org_user can only see their organization data'
    )
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users',
        help_text='Organization this user belongs to (required for org_user role)'
    )
    phone = models.CharField(max_length=20, blank=True)

    @property
    def is_admin(self):
        """Check if user is an admin"""
        return self.role == 'admin'

    @property
    def is_org_user(self):
        """Check if user is an organization user"""
        return self.role == 'org_user'

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return self.username
