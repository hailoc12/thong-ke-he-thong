"""
Request Logging Middleware for Django
Purpose: Log all API requests with full payloads for debugging and data recovery
Created: 2026-01-25
Usage: Add to MIDDLEWARE in settings.py
"""

import json
import logging
from django.utils.deprecation import MiddlewareMixin
from datetime import datetime

logger = logging.getLogger('api.requests')


class RequestLoggingMiddleware(MiddlewareMixin):
    """
    Log all API requests with full payload for debugging and data recovery.

    Logs include:
    - HTTP method, path, query params
    - User (authenticated or anonymous)
    - Client IP address
    - Request body (for POST/PUT/PATCH)
    - Timestamp

    Useful for:
    - Debugging save failures
    - Recovering lost data
    - Security auditing
    - Performance monitoring
    """

    def process_request(self, request):
        # Only log API requests (skip static files, admin, etc.)
        if not request.path.startswith('/api/'):
            return None

        # Build log data
        log_data = {
            'timestamp': datetime.now().isoformat(),
            'method': request.method,
            'path': request.path,
            'query_params': dict(request.GET),
            'user': str(request.user) if request.user.is_authenticated else 'anonymous',
            'user_id': request.user.id if request.user.is_authenticated else None,
            'ip': self.get_client_ip(request),
            'user_agent': request.META.get('HTTP_USER_AGENT', 'unknown'),
        }

        # Log request body for write operations
        if request.method in ['POST', 'PUT', 'PATCH']:
            try:
                # Try to parse JSON body
                body = json.loads(request.body.decode('utf-8'))
                log_data['body'] = body

                # Add special markers for important endpoints
                if '/systems/' in request.path:
                    log_data['_marker'] = '🔥 SYSTEM_DATA 🔥'  # Easy to grep

            except json.JSONDecodeError:
                # If not JSON, log raw body (truncated if too long)
                body_str = request.body.decode('utf-8', errors='ignore')
                log_data['body'] = body_str[:1000] + ('...' if len(body_str) > 1000 else '')
            except Exception as e:
                log_data['body_error'] = str(e)

        # Log with structured format
        logger.info(json.dumps(log_data, indent=2, ensure_ascii=False))

        return None

    def process_response(self, request, response):
        """Log response status for API requests"""
        if not request.path.startswith('/api/'):
            return response

        # Log response status
        log_data = {
            'timestamp': datetime.now().isoformat(),
            'method': request.method,
            'path': request.path,
            'status_code': response.status_code,
            'user': str(request.user) if request.user.is_authenticated else 'anonymous',
        }

        # Log errors with response body
        if response.status_code >= 400:
            try:
                # Try to decode response content
                content = response.content.decode('utf-8')
                log_data['response_body'] = content[:1000]  # Limit size
                log_data['_marker'] = '❌ ERROR ❌'
            except:
                pass

        logger.info(f"Response: {json.dumps(log_data, ensure_ascii=False)}")

        return response

    def get_client_ip(self, request):
        """Extract client IP from request (handles proxies)"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class SensitiveDataFilteringMiddleware(MiddlewareMixin):
    """
    Filter sensitive data from logs (passwords, tokens, etc.)
    Use this if you're logging to external services or shared storage.
    """

    SENSITIVE_FIELDS = [
        'password',
        'password_confirmation',
        'token',
        'secret',
        'api_key',
        'credit_card',
        'ssn',
    ]

    def process_request(self, request):
        if not request.path.startswith('/api/'):
            return None

        if request.method in ['POST', 'PUT', 'PATCH']:
            try:
                body = json.loads(request.body.decode('utf-8'))
                filtered_body = self.filter_sensitive_data(body)

                # Log filtered version
                log_data = {
                    'path': request.path,
                    'method': request.method,
                    'body': filtered_body,
                }
                logger.info(f"Request (filtered): {json.dumps(log_data, ensure_ascii=False)}")

            except:
                pass

        return None

    def filter_sensitive_data(self, data):
        """Recursively filter sensitive fields from dict"""
        if isinstance(data, dict):
            filtered = {}
            for key, value in data.items():
                if any(sensitive in key.lower() for sensitive in self.SENSITIVE_FIELDS):
                    filtered[key] = '***REDACTED***'
                else:
                    filtered[key] = self.filter_sensitive_data(value)
            return filtered
        elif isinstance(data, list):
            return [self.filter_sensitive_data(item) for item in data]
        else:
            return data
