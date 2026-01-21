# Hướng Dẫn Deploy Lên Production Server

## ✅ Code đã được push lên Git

- Commit: `feat(validation): Add comprehensive required field validation`
- Commit: `chore: Add deployment script with database check`
- Branch: `main`

---

## 🚀 CÁCH 1: Chạy Script Tự Động (Khuyên dùng)

### Trên server production, chạy:

```bash
# SSH vào server
ssh ubuntu@hientrangcds.mst.gov.vn

# Chuyển đến thư mục project
cd /home/ubuntu/thong-ke-he-thong

# Pull code mới
git pull origin main

# Chạy deployment script
./DEPLOY-VALIDATION-AND-CHECK-DB.sh
```

Script này sẽ tự động:
1. ✅ Pull latest code
2. ✅ Build frontend
3. ✅ Restart containers
4. ✅ Chạy database check (4 queries)
5. ✅ Hiển thị kết quả

---

## 🔧 CÁCH 2: Chạy Từng Bước Thủ Công

```bash
# SSH vào server
ssh ubuntu@hientrangcds.mst.gov.vn

cd /home/ubuntu/thong-ke-he-thong

# Step 1: Pull code
git pull origin main

# Step 2: Build frontend
cd frontend
npm install
npm run build
cd ..

# Step 3: Restart containers
docker compose restart frontend

# Step 4: Check database
docker compose exec postgres psql -U postgres -d thongke -f /08-backlog-plan/check-database-state.sql
```

---

## 📊 Kiểm Tra Kết Quả

### 1. Verify validation features
Mở browser: https://hientrangcds.mst.gov.vn/systems/create

Test:
- [ ] Thử save Tab 1 mà không điền required fields → Phải bị block
- [ ] Điền đầy đủ → Button "Lưu & Tiếp tục" sáng lên
- [ ] Tab có checkmark xanh khi valid

### 2. Check database results
Sau khi chạy script, xem output:

```
Tổng đơn vị | Có user | Thiếu user
-----------+---------+-----------
    39     |    ?    |     ?
```

**Nếu "Thiếu user" > 0**, chạy:
```bash
docker compose cp 08-backlog-plan/check-and-create-missing-users.py backend:/app/
docker compose exec backend python /app/check-and-create-missing-users.py
```

---

## ❓ Về câu hỏi: "Data hoạt động gần đây tôi đã yêu cầu xóa đi rồi mà?"

Bạn có thể đang nói về:

### A. Test data trong database?
Nếu muốn xóa test organizations/users:
```bash
# Xóa tất cả organizations (NGUY HIỂM!)
docker compose exec postgres psql -U postgres -d thongke -c "DELETE FROM organizations WHERE name LIKE '%Test%';"

# Hoặc chỉ xóa user test
docker compose exec postgres psql -U postgres -d thongke -c "DELETE FROM users WHERE username LIKE '%test%';"
```

### B. Git history/commits?
Nếu muốn xóa sensitive data khỏi git history:
```bash
# Xem recent commits
git log --oneline -10

# Revert một commit
git revert <commit-hash>
```

### C. Log files?
```bash
# Xóa Docker logs
docker compose logs --tail=0 -f > /dev/null

# Clear application logs
rm -f backend/logs/*.log
```

Bạn muốn xóa loại data nào? Tôi sẽ giúp cụ thể hơn.

---

## 🆘 Troubleshooting

### Permission denied
```bash
chmod +x DEPLOY-VALIDATION-AND-CHECK-DB.sh
```

### Docker not running
```bash
sudo systemctl start docker
docker compose ps
```

### Frontend build errors
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

**Created**: 2026-01-21
**Status**: ✅ Code pushed, ready to deploy
