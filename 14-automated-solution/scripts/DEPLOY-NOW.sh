#!/bin/bash
# DEPLOY NGAY - Chạy file này trong Terminal

set -e
cd "/Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong"

echo "========================================================================"
echo "🚀 DEPLOYING TO PRODUCTION..."
echo "========================================================================"
echo ""

# Step 1: Clear emails
echo "📝 [1/4] Xóa emails trong database..."
cat 08-backlog-plan/clear-all-emails.sql | docker compose exec -T postgres psql -U postgres -d thongke
echo "✅ Done!"
echo ""

# Step 2: Build frontend
echo "🔨 [2/4] Building frontend..."
cd frontend
npm run build
cd ..
echo "✅ Done!"
echo ""

# Step 3: Restart frontend
echo "🔄 [3/4] Restarting frontend..."
docker compose restart frontend
echo "✅ Done!"
echo ""

# Step 4: Verify
echo "🔍 [4/4] Verifying..."
docker compose ps
echo ""
docker compose exec postgres psql -U postgres -d thongke -c "SELECT COUNT(*) as total, SUM(CASE WHEN email = '' THEN 1 ELSE 0 END) as cleared FROM users;" -t
echo ""

echo "========================================================================"
echo "✅ DEPLOYMENT HOÀN TẤT!"
echo "========================================================================"
echo ""
echo "🌐 Truy cập: https://hientrangcds.mst.gov.vn"
echo ""
echo "📋 Đã deploy:"
echo "  ✅ Xóa emails users"
echo "  ✅ Ẩn columns Email và Họ và tên (Users)"
echo "  ✅ Hiển thị tổng số đơn vị (Organizations)"
echo "  ✅ Xóa dummy data (Dashboard)"
echo ""
