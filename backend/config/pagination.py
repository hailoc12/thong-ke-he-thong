"""
Custom pagination classes for the project
"""
from rest_framework.pagination import PageNumberPagination


class CustomPageNumberPagination(PageNumberPagination):
    """
    Custom pagination class that allows client to control page size.

    Settings:
    - Default page size: 20
    - Client can request custom page size via ?page_size=N
    - Maximum page size allowed: 1000 (for Excel exports)

    Usage:
    - /api/systems/ → Returns 20 items (default)
    - /api/systems/?page_size=100 → Returns 100 items
    - /api/systems/?page_size=1000 → Returns up to 1000 items (for Excel export)
    """
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 1000
