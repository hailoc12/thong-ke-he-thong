#!/bin/bash
# Script flush Redis Celery tasks
# CAUTION: This will delete all pending Celery tasks

SERVER="admin_@34.142.152.104"

echo "========================================="
echo "🗑️  FLUSH REDIS CELERY TASKS"
echo "========================================="
echo ""

echo "⚠️  WARNING: This will delete all pending Celery tasks!"
echo "Press CTRL+C to cancel, or ENTER to continue..."
read -r

echo ""
echo "1️⃣ Checking current queue size..."
QUEUE_SIZE=$(ssh -o ConnectTimeout=10 "$SERVER" "docker exec redis_production_mindmaid redis-cli --scan --pattern 'celery*' 2>/dev/null | wc -l")
echo "Current celery tasks: $QUEUE_SIZE"
echo ""

if [ "$QUEUE_SIZE" -gt 0 ]; then
    echo "2️⃣ Flushing Celery tasks..."
    ssh -o ConnectTimeout=10 "$SERVER" << 'ENDSSH'
# Delete all celery keys
docker exec redis_production_mindmaid redis-cli --scan --pattern "celery*" | while read key; do
    docker exec redis_production_mindmaid redis-cli DEL "$key"
done
echo "✅ Flushed all celery tasks"
ENDSSH

    echo ""
    echo "3️⃣ Verifying..."
    NEW_SIZE=$(ssh -o ConnectTimeout=10 "$SERVER" "docker exec redis_production_mindmaid redis-cli --scan --pattern 'celery*' 2>/dev/null | wc -l")
    echo "Remaining celery tasks: $NEW_SIZE"
else
    echo "✅ No celery tasks to flush"
fi

echo ""
echo "========================================="
echo "✅ DONE"
echo "========================================="
