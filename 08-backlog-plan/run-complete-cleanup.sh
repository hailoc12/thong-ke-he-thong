#!/bin/bash
# Run complete cleanup and fresh data creation script

cd /Users/shimazu/Dropbox/9.\ active/consultant/support_b4t/thong_ke_he_thong

# Copy script into container and execute
docker compose cp 08-backlog-plan/complete-cleanup-and-fresh-data.py backend:/tmp/complete-cleanup-and-fresh-data.py

# Execute script in Django shell
docker compose exec backend python manage.py shell < /tmp/complete-cleanup-and-fresh-data.py
