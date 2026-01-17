"""
Custom permissions for role-based access control
"""
from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """
    Permission to allow only admin users
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class IsOrgUserOrAdmin(permissions.BasePermission):
    """
    Permission to allow authenticated users
    Object-level permission to allow:
    - Admin: access to all objects
    - Org User: access only to objects in their organization
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Admin can access everything
        if request.user.role == 'admin':
            return True

        # Org user can only access objects from their organization
        if hasattr(obj, 'organization'):
            return obj.organization == request.user.organization

        # If object doesn't have organization field, deny access
        return False


class CanManageOrgSystems(permissions.BasePermission):
    """
    Permission to manage systems
    - Admin: can create/edit systems for any organization
    - Org User: can create/edit systems only for their organization
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Admin can manage all systems
        if request.user.role == 'admin':
            return True

        # Org user can only manage systems in their organization
        if request.user.role == 'org_user':
            return obj.organization == request.user.organization

        return False
