#!/usr/bin/env bash
# Force restart - stop ALL containers first
set -e

SERVER="admin_@34.142.152.104"
PASSWORD="aivnews_xinchao_#*2020"

echo "🔄 Force restarting all containers..."

sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=60 "$SERVER" bash << 'ENDSSH'
cd /home/admin_/apps/thong-ke-he-thong

echo "📦 Pulling latest code..."
git pull origin main || git pull origin master

echo "🛑 Stopping ALL running containers..."
docker stop $(docker ps -q) 2>/dev/null || echo "No containers running"

echo "🗑️  Removing ALL containers..."
docker rm $(docker ps -aq) 2>/dev/null || echo "No containers to remove"

echo "🏗️  Building images..."
docker compose build --no-cache

echo "▶️  Starting containers..."
docker compose up -d

echo "⏳ Waiting for services..."
sleep 25

echo "✅ Container Status:"
docker compose ps

echo "📋 Backend logs:"
docker compose logs --tail 40 backend

echo "✅ Restart complete!"
ENDSSH

echo ""
echo "🌐 Site: https://thongkehethong.mindmaid.ai/"
echo "⏱️  Wait 30-60 seconds for Cloudflare cache to expire"
