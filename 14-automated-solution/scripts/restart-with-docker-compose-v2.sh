#!/usr/bin/env bash
# Restart using newer "docker compose" command
set -e

SERVER="admin_@34.142.152.104"
PASSWORD="aivnews_xinchao_#*2020"

echo "🔄 Restarting with docker compose (v2)..."

sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=60 "$SERVER" bash << 'ENDSSH'
cd /home/admin_/apps/thong-ke-he-thong

echo "📦 Pulling latest code..."
git pull origin main || git pull origin master

echo "🛑 Stopping containers..."
docker compose down || docker-compose down

echo "🏗️  Rebuilding images..."
docker compose build --no-cache || docker-compose build --no-cache

echo "▶️  Starting containers..."
docker compose up -d || docker-compose up -d

echo "⏳ Waiting for services..."
sleep 20

echo "✅ Container Status:"
docker compose ps || docker-compose ps

echo "📋 Backend logs:"
docker compose logs --tail 30 backend || docker-compose logs --tail 30 backend

echo "✅ Restart complete!"
ENDSSH

echo ""
echo "🌐 Site: https://thongkehethong.mindmaid.ai/"
echo "⏱️  Wait 30-60 seconds for Cloudflare cache to expire"
