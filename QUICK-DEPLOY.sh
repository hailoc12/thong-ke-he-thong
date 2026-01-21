#!/bin/bash
# Quick deployment - No prompts, just deploy
# Usage: ./QUICK-DEPLOY.sh

set -e

echo "🚀 Deploying to production..."
echo ""

ssh ubuntu@hientrangcds.mst.gov.vn << 'ENDSSH'
set -e
cd /home/ubuntu/thong-ke-he-thong

echo "📦 Pulling code..."
git pull origin main

echo "📦 Installing dependencies..."
cd frontend && npm install --quiet && cd ..

echo "🔨 Building frontend..."
cd frontend && npm run build && cd ..

echo "🔄 Restarting containers..."
docker compose restart frontend backend
sleep 5

echo "✅ Checking status..."
docker compose ps

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "Test at: https://hientrangcds.mst.gov.vn"
echo ""

ENDSSH

echo ""
echo "✅ Done!"
