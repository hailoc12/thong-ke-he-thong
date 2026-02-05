# Project Memory - Thống Kê Hệ Thống CDS

## 🔗 CRITICAL: Server URLs & Ports (NEVER FORGET!)

### Production Server
- **Public URL:** https://hientrangcds.mst.gov.vn
- **Frontend Port:** 3000
- **Backend Port:** 8000 ⚠️
- **Branch:** main
- **Path:** /home/admin_/apps/thong-ke-he-thong
- **Status:** STABLE - Public facing

### UAT Server (Testing)
- **Public URL:** https://hientrangcds.mindmaid.ai
- **Frontend Port:** 3002
- **Backend Port:** 8002 ⚠️
- **Branch:** develop
- **Path:** /home/admin_/apps/thong-ke-he-thong-uat
- **Status:** TESTING - For QA before production

### SSH Access
```bash
ssh admin_@34.142.152.104
cd /home/admin_/apps/thong-ke-he-thong  # Production
cd /home/admin_/apps/thong-ke-he-thong-uat  # UAT
```

### ⚠️ CRITICAL: Backend API Ports
```
Production Backend: localhost:8000 (inside server)
UAT Backend:        localhost:8002 (inside server)
```

**ALWAYS verify port when testing backend APIs!**

---

## 📋 Deployment Rules

### ⚠️ NEVER:
1. Deploy develop to production directly
2. Test on local machine - ALWAYS via SSH
3. Skip Docker build cache clearing
4. Confuse UAT and Production URLs

### ✅ ALWAYS:
1. Test on UAT first: https://hientrangcds.mindmaid.ai
2. Clear cache before build:
   ```bash
   docker builder prune -af
   DOCKER_BUILDKIT=0 docker compose build frontend --no-cache
   ```
3. Verify JS bundle changed after deployment

---

## 🚀 Quick Commands

### Check Status
```bash
# Check containers
ssh admin_@34.142.152.104 "docker ps | grep frontend"

# Check UAT
curl -s "https://hientrangcds.mindmaid.ai" | grep -o 'index-[^"]*\.js'

# Check Production
curl -s "https://hientrangcds.mst.gov.vn" | grep -o 'index-[^"]*\.js'
```

### Deploy to UAT
```bash
ssh admin_@34.142.152.104
cd /home/admin_/apps/thong-ke-he-thong
git checkout develop && git pull
docker builder prune -af
DOCKER_BUILDKIT=0 docker compose -p thong-ke-he-thong-uat build frontend --no-cache
docker compose -p thong-ke-he-thong-uat up -d frontend
```

### Deploy Backend to UAT
```bash
# 1. Copy file
scp backend/apps/systems/views.py admin_@34.142.152.104:/home/admin_/apps/thong-ke-he-thong-uat/backend/apps/systems/views.py

# 2. Stop & Start (NOT restart!) to reload Python modules
ssh admin_@34.142.152.104 'cd /home/admin_/apps/thong-ke-he-thong-uat && docker compose stop backend && sleep 3 && docker compose start backend'

# 3. Test on port 8002
```

### Deploy Backend to Production
```bash
# 1. Copy file
scp backend/apps/systems/views.py admin_@34.142.152.104:/home/admin_/apps/thong-ke-he-thong/backend/apps/systems/views.py

# 2. Stop & Start (NOT restart!)
ssh admin_@34.142.152.104 'cd /home/admin_/apps/thong-ke-he-thong && docker compose stop backend && sleep 3 && docker compose start backend'

# 3. Test on port 8000
```

### Deploy Frontend to Production
```bash
ssh admin_@34.142.152.104
cd /home/admin_/apps/thong-ke-he-thong
git checkout main && git pull
docker builder prune -af
DOCKER_BUILDKIT=0 docker compose build frontend --no-cache
docker compose up -d frontend
```

---

## 🔐 Test Credentials

### Admin
- Username: `admin`
- Password: `Admin@2026`

### Organization Users
- `vu-buuchinh` / `ThongkeCDS@2026#`
- `ptit` / `ThongkeCDS@2026#`
- `vnnic` / `ThongkeCDS@2026#`

### Leadership User (for AI Assistant)
- `lanhdaobao` / `BoKHCN@2026` (⚠️ may not exist on UAT - need to verify)
- **Note**: AI Assistant/Strategic Dashboard chỉ available cho leadership users, không phải admin

---

## 📊 Current Features

### AI Assistant (7 Improvements - UAT Only)
1. Sample questions visible by default
2. Click sample = auto-submit
3. Voice input hidden
4. Dark mode & PDF export hidden
5. Progress section collapsed by default
6. Duration text positioned higher
7. History button in AI input section

**Test at:** https://hientrangcds.mindmaid.ai/dashboard/strategic

### D3.js Visualization System (NEW - 2026-02-05) ✅
**Status**: Deployed to UAT, ready for testing

Features:
- ✅ Interactive D3.js table (search, sort, filter)
- ✅ Animated bar/pie/line charts
- ✅ Full Vietnamese translation
- ✅ Modern design with gradients & shadows
- ✅ Error handling with auto-fallback
- ✅ Smooth animations and transitions

**Files Modified**:
- `backend/apps/systems/views.py` (~600 lines added)
  - `_generate_d3_table()` - Interactive table
  - `_generate_d3_bar_chart()` - Animated bar chart
  - `_generate_d3_pie_chart()` - Donut pie chart
  - `_generate_d3_line_chart()` - Time series line chart
  - `_vietnamize_column_name()` - Vietnamese labels

**Testing**:
```bash
# Test on UAT (port 8002)
ssh admin_@34.142.152.104 'bash -s' << 'EOF'
TOKEN=$(curl -s -X POST "http://localhost:8002/api/token/" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@2026"}' | jq -r '.access')
curl -s "http://localhost:8002/api/systems/ai_query_stream/?query=Test&token=$TOKEN&mode=quick" | grep "d3js.org"
EOF
```

**Deployment to Production**: Pending user approval after UAT testing

### D3.js Pagination & Answer Fix (BUG FIX - 2026-02-05) ✅
**Status**: Deployed to UAT, verified working

**Bugs Fixed**:
1. **Bug #1 - No Pagination**: Visualization displayed all 87 systems without pagination
   - **Fix**: Added D3.js pagination with max 10 rows per page
   - Previous/Next buttons ("Trước" / "Sau »")
   - Page number indicators with active state
   - Footer shows "Hiển thị 1-10 / 87 kết quả"

2. **Bug #2 - Answer Wrong Information**: Answer generation received wrong data after post-processing
   - **Fix**: Keep BOTH results - `answer_data` for answer, `viz_data` for visualization
   - Answer uses original COUNT result
   - Visualization uses system list with IDs for hyperlinks

**Code Changes**:
- Lines 744-790: Pagination CSS styles
- Lines 830-988: JavaScript pagination logic (goToPage, renderPagination)
- Lines 3886-3919: Dual result handling (answer_data vs viz_data)
- Lines 4041-4109: Updated answer/visualization generation

**Testing**:
```bash
# Verify on UAT (port 8002)
ssh admin_@34.142.152.104 'bash -s' << 'EOF'
TOKEN=$(curl -s -X POST "http://localhost:8002/api/token/" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@2026"}' | jq -r '.access')
curl -s "http://localhost:8002/api/systems/ai_query_stream/?query=Có%20bao%20nhiêu%20hệ%20thống&token=$TOKEN&mode=quick" > /tmp/test.txt
grep -c "pageSize = 10" /tmp/test.txt  # Should output: 1
grep -c "goToPage" /tmp/test.txt       # Should output: 1
EOF
```

**Report**: See `BUG_FIX_REPORT_2026-02-05.md` for full details
