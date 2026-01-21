#!/bin/bash
# Script to check database state - kiểm tra trạng thái database

set -e
cd "/Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong"

echo "========================================================================"
echo "🔍 KIỂM TRA TRẠNG THÁI DATABASE"
echo "========================================================================"
echo ""

# Try to find docker
DOCKER_CMD=""
if command -v docker &> /dev/null; then
    DOCKER_CMD="docker"
elif [ -f "/usr/local/bin/docker" ]; then
    DOCKER_CMD="/usr/local/bin/docker"
elif [ -f "/Applications/Docker.app/Contents/Resources/bin/docker" ]; then
    DOCKER_CMD="/Applications/Docker.app/Contents/Resources/bin/docker"
else
    echo "❌ Không tìm thấy Docker. Vui lòng:"
    echo "   1. Cài đặt Docker Desktop"
    echo "   2. Khởi động Docker Desktop"
    echo "   3. Chạy lại script này"
    exit 1
fi

echo "✅ Tìm thấy Docker: $DOCKER_CMD"
echo ""

# Check if Docker is running
if ! $DOCKER_CMD info > /dev/null 2>&1; then
    echo "❌ Docker không chạy. Đang thử khởi động Docker Desktop..."
    open -a Docker 2>/dev/null || true
    echo "⏳ Đợi 15 giây để Docker khởi động..."
    sleep 15

    # Check again
    if ! $DOCKER_CMD info > /dev/null 2>&1; then
        echo "❌ Docker vẫn không chạy. Vui lòng:"
        echo "   1. Mở Docker Desktop thủ công"
        echo "   2. Đợi cho đến khi thấy icon Docker xanh lá"
        echo "   3. Chạy lại script này"
        exit 1
    fi
fi

echo "✅ Docker đang chạy"
echo ""

# Run SQL queries
echo "📊 Chạy các queries kiểm tra..."
echo ""

$DOCKER_CMD compose exec -T postgres psql -U postgres -d thongke -f /08-backlog-plan/check-database-state.sql

echo ""
echo "========================================================================"
echo "✅ HOÀN TẤT KIỂM TRA"
echo "========================================================================"
