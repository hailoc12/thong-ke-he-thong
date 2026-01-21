#!/bin/bash
# Deploy tất cả thay đổi lên production

set -e  # Exit on error

cd "/Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong"

echo "========================================================================"
echo "DEPLOY TẤT CẢ THAY ĐỔI LÊN PRODUCTION"
echo "========================================================================"
echo ""

# Step 1: Clear all user emails in database
echo "📝 Step 1/4: Xóa toàn bộ email users trong database..."
echo "------------------------------------------------------------------------"
cat 08-backlog-plan/clear-all-emails.sql | docker compose exec -T postgres psql -U postgres -d thongke
echo "✅ Done!"
echo ""

# Step 2: Rebuild frontend
echo "🔨 Step 2/4: Rebuild frontend với các thay đổi UI..."
echo "------------------------------------------------------------------------"
echo "   - Đã ẩn columns Email và Họ và tên trong Users"
echo "   - Đã thêm tổng số đơn vị trong Organizations"
echo "   - Đã xóa dummy data trong 'Hoạt động gần đây'"
echo ""
cd frontend
npm run build
cd ..
echo "✅ Done!"
echo ""

# Step 3: Restart frontend service
echo "🔄 Step 3/4: Restart frontend service..."
echo "------------------------------------------------------------------------"
docker compose restart frontend
echo "✅ Done!"
echo ""

# Step 4: Verify deployment
echo "🔍 Step 4/4: Kiểm tra deployment..."
echo "------------------------------------------------------------------------"

# Check if services are running
echo "Checking services status..."
docker compose ps

echo ""
echo "Checking user emails cleared..."
docker compose exec postgres psql -U postgres -d thongke -c "SELECT COUNT(*) as total_users, SUM(CASE WHEN email = '' THEN 1 ELSE 0 END) as users_with_empty_email FROM users;" -t

echo ""
echo "========================================================================"
echo "✅ DEPLOYMENT HOÀN TẤT!"
echo "========================================================================"
echo ""
echo "📋 Các thay đổi đã deploy:"
echo ""
echo "1. ✅ Database:"
echo "   - Xóa toàn bộ email của users"
echo ""
echo "2. ✅ Frontend UI:"
echo "   - Ẩn columns 'Email' và 'Họ và tên' trong trang Quản lý người dùng"
echo "   - Hiển thị tổng số đơn vị trong trang Danh sách Đơn vị"
echo "   - Xóa dummy data trong 'Hoạt động gần đây' (Dashboard)"
echo ""
echo "3. ✅ Services:"
echo "   - Frontend đã được restart và đang chạy"
echo ""
echo "🌐 Truy cập: https://hientrangcds.mst.gov.vn"
echo ""
echo "📝 Ghi chú:"
echo "   - Nếu chưa thấy thay đổi, hãy hard refresh (Ctrl+Shift+R hoặc Cmd+Shift+R)"
echo "   - Các thay đổi sẽ có hiệu lực ngay lập tức"
echo ""
