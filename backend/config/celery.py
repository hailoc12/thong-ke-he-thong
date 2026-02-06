"""
Celery Configuration for Auto-Generate Policies Feature
"""
import os
from celery import Celery

# Set default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Create Celery app
app = Celery('backend')

# Load config from Django settings with CELERY namespace
# This means all celery-related settings should be prefixed with CELERY_
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks from all registered Django apps
app.autodiscover_tasks()


@app.task(bind=True)
def debug_task(self):
    """Debug task to verify Celery is working"""
    print(f'Request: {self.request!r}')
