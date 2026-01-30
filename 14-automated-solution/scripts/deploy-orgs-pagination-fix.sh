#!/bin/bash
# Fix: Organizations API pagination - fetch ALL 32 organizations for Excel export
# Issue: fetchOrganizations was only getting first page (20 orgs) due to pagination

set -e

SERVER="admin@34.142.152.104"
PASSWORD="aivnews_xinchao_#*2020"
PROJECT_DIR="~/thong_ke_he_thong"

echo "=== Deploying organizations pagination fix ==="

# Base64 encode the Dashboard.tsx file
LOCAL_FILE="frontend/src/pages/Dashboard.tsx"
ENCODED=$(base64 < "$LOCAL_FILE")

# SSH to server and deploy
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no "$SERVER" << ENDSSH
cd $PROJECT_DIR

# Decode and write the file
echo "$ENCODED" | base64 -d > frontend/src/pages/Dashboard.tsx

echo "File updated. Verifying change..."
grep -A 5 "fetchOrganizations = async" frontend/src/pages/Dashboard.tsx

# Clear Docker build cache and rebuild frontend
echo "Clearing Docker build cache..."
docker builder prune -af

echo "Building frontend without cache..."
DOCKER_BUILDKIT=0 docker compose build frontend --no-cache

# Restart frontend
echo "Restarting frontend..."
docker compose up -d frontend

echo "Waiting for frontend to be healthy..."
sleep 10

docker compose ps frontend

echo "=== Deployment complete ==="
echo "Verify: Open dashboard and export Excel - should now show all 32 organizations"
ENDSSH

echo "=== Script finished ==="
