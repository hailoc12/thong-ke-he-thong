#!/bin/bash
# Script to check and create missing organization users

set -e
cd "/Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong"

echo "========================================================================"
echo "🔍 KIỂM TRA VÀ TẠO USER CHO CÁC ĐƠN VỊ"
echo "========================================================================"
echo ""

# Check if Docker is running
if ! /usr/local/bin/docker info > /dev/null 2>&1; then
    echo "❌ Docker không chạy. Vui lòng khởi động Docker Desktop."
    echo ""
    echo "Thử mở Docker:"
    open -a Docker
    echo ""
    echo "Đợi 10 giây để Docker khởi động..."
    sleep 10
fi

echo "📝 Chạy script kiểm tra..."
echo ""

# Copy script to backend container and run
/usr/local/bin/docker compose exec -T backend python /app/08-backlog-plan/check-and-create-missing-users.py

echo ""
echo "========================================================================"
echo "✅ HOÀN TẤT!"
echo "========================================================================"
