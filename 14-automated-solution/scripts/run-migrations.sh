#!/usr/bin/env bash
set -e

SERVER="admin_@34.142.152.104"
PASSWORD="aivnews_xinchao_#*2020"

echo "🔄 Running migrations on remote server..."

sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=60 "$SERVER" bash << 'ENDSSH'
cd /home/admin_/apps/thong-ke-he-thong

echo "📋 Running migrations..."
docker compose exec -T backend python manage.py migrate || docker-compose exec -T backend python manage.py migrate

echo "✅ Migrations complete!"

echo "📋 Migration history:"
docker compose exec -T backend python manage.py showmigrations systems || docker-compose exec -T backend python manage.py showmigrations systems
ENDSSH

echo "✅ Done!"
