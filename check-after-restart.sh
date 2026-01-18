#!/bin/bash
# Script kiểm tra sau khi restart server
# Run: ./check-after-restart.sh

SERVER="admin_@34.142.152.104"
APP_DIR="/home/admin_/apps/thong-ke-he-thong"

echo "========================================="
echo "🔍 KIỂM TRA HỆ THỐNG SAU KHI RESTART"
echo "========================================="
echo ""

echo "1️⃣ SYSTEM LOAD & UPTIME"
echo "---"
ssh -o ConnectTimeout=10 "$SERVER" "uptime"
echo ""

echo "2️⃣ MEMORY USAGE"
echo "---"
ssh -o ConnectTimeout=10 "$SERVER" "free -h"
echo ""

echo "3️⃣ DISK USAGE"
echo "---"
ssh -o ConnectTimeout=10 "$SERVER" "df -h / | tail -1"
echo ""

echo "4️⃣ CONTAINER STATUS (All)"
echo "---"
ssh -o ConnectTimeout=10 "$SERVER" "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Size}}' | head -20"
echo ""

echo "5️⃣ PROJECT CONTAINERS"
echo "---"
ssh -o ConnectTimeout=10 "$SERVER" "cd $APP_DIR && docker-compose ps"
echo ""

echo "6️⃣ BACKEND LOGS (Last 30 lines)"
echo "---"
ssh -o ConnectTimeout=10 "$SERVER" "cd $APP_DIR && docker-compose logs --tail 30 backend"
echo ""

echo "7️⃣ REDIS STATS"
echo "---"
ssh -o ConnectTimeout=10 "$SERVER" "docker exec redis_production_mindmaid redis-cli INFO stats | grep -E 'total_commands_processed|total_connections_received|keyspace_hits|keyspace_misses'"
echo ""

echo "8️⃣ REDIS MEMORY"
echo "---"
ssh -o ConnectTimeout=10 "$SERVER" "docker exec redis_production_mindmaid redis-cli INFO memory | grep -E 'used_memory_human|used_memory_peak_human|maxmemory'"
echo ""

echo "9️⃣ CELERY QUEUE STATUS"
echo "---"
echo "Checking celery queues..."
ssh -o ConnectTimeout=10 "$SERVER" "docker exec redis_production_mindmaid redis-cli LLEN celery 2>/dev/null || echo '0'"
ssh -o ConnectTimeout=10 "$SERVER" "docker exec redis_production_mindmaid redis-cli --scan --pattern 'celery*' 2>/dev/null | wc -l || echo '0'"
echo ""

echo "🔟 TOP PROCESSES (CPU)"
echo "---"
ssh -o ConnectTimeout=10 "$SERVER" "ps aux --sort=-%cpu | head -10"
echo ""

echo "========================================="
echo "✅ KIỂM TRA HOÀN TẤT"
echo "========================================="
