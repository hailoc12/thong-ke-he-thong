#!/usr/bin/env bash
# Direct Docker restart without docker-compose
set -e

SERVER="admin_@34.142.152.104"
PASSWORD="aivnews_xinchao_#*2020"

echo "🔄 Restarting Docker containers directly..."

sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=60 "$SERVER" bash << 'ENDSSH'
cd /home/admin_/apps/thong-ke-he-thong

echo "📦 Pulling latest code..."
git pull origin main || git pull origin master

echo "🛑 Stopping containers..."
docker stop $(docker ps -q --filter "name=thong-ke-he-thong") 2>/dev/null || echo "No containers to stop"

echo "🗑️  Removing old containers..."
docker rm $(docker ps -aq --filter "name=thong-ke-he-thong") 2>/dev/null || echo "No containers to remove"

echo "🏗️  Rebuilding backend image..."
docker build -t thong-ke-backend:latest ./backend

echo "🏗️  Rebuilding frontend image..."
docker build -t thong-ke-frontend:latest ./frontend

echo "▶️  Starting PostgreSQL..."
docker run -d \
  --name thong-ke-postgres \
  --network thong-ke-network \
  -e POSTGRES_DB=thongke \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres123 \
  -v thong-ke-postgres-data:/var/lib/postgresql/data \
  postgres:15

echo "⏳ Waiting for PostgreSQL..."
sleep 10

echo "▶️  Starting Redis..."
docker run -d \
  --name thong-ke-redis \
  --network thong-ke-network \
  redis:7-alpine

echo "▶️  Starting Backend..."
docker run -d \
  --name thong-ke-backend \
  --network thong-ke-network \
  -p 8000:8000 \
  -e DATABASE_URL=postgresql://postgres:postgres123@thong-ke-postgres:5432/thongke \
  -e REDIS_URL=redis://thong-ke-redis:6379/0 \
  thong-ke-backend:latest

echo "⏳ Waiting for backend migration..."
sleep 15

echo "▶️  Starting Frontend..."
docker run -d \
  --name thong-ke-frontend \
  --network thong-ke-network \
  -p 80:80 \
  thong-ke-frontend:latest

echo "⏳ Waiting for services..."
sleep 10

echo "✅ Container Status:"
docker ps --filter "name=thong-ke"

echo "📋 Backend logs:"
docker logs --tail 30 thong-ke-backend

echo "✅ Restart complete!"
ENDSSH

echo ""
echo "🌐 Site: https://thongkehethong.mindmaid.ai/"
echo "⏱️  Wait 30 seconds for Cloudflare cache, then test"
