# Thông tin Production & UAT Servers

## Server Infrastructure

**SSH Access:** `ssh admin_@34.142.152.104`
**Project Path:** `/home/admin_/apps/thong-ke-he-thong`

---

## UAT Environment (User Acceptance Testing)

### Domain
- **URL:** https://hientrangcds.mindmaid.ai
- **Direct IP:** http://34.142.152.104:3002

### Container Names
- **Frontend:** `thong-ke-he-thong-uat-frontend-1`
- **Backend:** `thong-ke-he-thong-uat-backend-1`
- **Database:** `thong-ke-he-thong-uat-postgres-1`

### Ports
- **Frontend:** `0.0.0.0:3002->80/tcp`
- **Backend:** `0.0.0.0:8002->8000/tcp`

### Git Branch
- **Branch:** `develop`
- **Current Commit:** `fd52d6f - feat(ai-ui): Implement 7 UI improvements for AI Assistant`

### JS Bundle
- **File:** `index-DB2RW1z2.js` (built Feb 3 14:37)
- **Status:** ✅ NEW version WITH 7 UI improvements

### Routing
- Cloudflare proxies `hientrangcds.mindmaid.ai` → Server IP:3002

---

## Production Environment

### Domain
- **URL:** https://hientrangcds.mst.gov.vn
- **Direct IP:** http://34.142.152.104:3000

### Container Names
- **Frontend:** `thong-ke-he-thong-frontend-1`
- **Backend:** `thong-ke-he-thong-backend-1`
- **Database:** `thong-ke-he-thong-postgres-1`

### Ports
- **Frontend:** `0.0.0.0:3000->80/tcp`
- **Backend:** `0.0.0.0:8000->8000/tcp`

### Git Branch
- **Branch:** `main` (or stable commits from develop)
- **Current Commit:** `a4bfbf3 - fix(ai): Fix P0 bugs - template replacement & connection error dialog`

### JS Bundle
- **File:** `index-DotoWVP6.js` (built Feb 3 14:51)
- **Status:** ✅ Stable version WITHOUT 7 UI improvements

### Routing
- Domain `hientrangcds.mst.gov.vn` → Server IP:3000

---

## Deployment Procedures

### Deploy to UAT (port 3002)
```bash
# SSH to server
ssh admin_@34.142.152.104

# Navigate to project
cd /home/admin_/apps/thong-ke-he-thong

# Checkout develop branch
git checkout develop
git pull origin develop

# Clear build cache
docker builder prune -af

# Build UAT frontend
DOCKER_BUILDKIT=0 docker compose -p thong-ke-he-thong-uat build frontend --no-cache

# Restart UAT
docker compose -p thong-ke-he-thong-uat up -d frontend
docker compose -p thong-ke-he-thong-uat restart backend

# Verify
docker ps | grep uat-frontend
docker exec thong-ke-he-thong-uat-frontend-1 ls -la /usr/share/nginx/html/assets/
curl -s "https://hientrangcds.mindmaid.ai" | grep -o 'index-[^"]*\.js'
```

### Deploy to Production (port 3000)
```bash
# SSH to server
ssh admin_@34.142.152.104

# Navigate to project
cd /home/admin_/apps/thong-ke-he-thong

# Checkout stable code (main or specific commit)
git checkout main
git pull origin main

# Clear build cache
docker builder prune -af

# Build production frontend
DOCKER_BUILDKIT=0 docker compose build frontend --no-cache

# Restart production
docker compose up -d frontend
docker compose restart backend

# Verify
docker ps | grep frontend
docker exec thong-ke-he-thong-frontend-1 ls -la /usr/share/nginx/html/assets/
curl -s "https://hientrangcds.mst.gov.vn" | grep -o 'index-[^"]*\.js'
```

---

## Critical Rules

### ⚠️ NEVER DO:
1. **NEVER deploy develop branch code to production directly**
2. **NEVER test or run builds on local machine** - Always SSH to server
3. **NEVER skip Docker build cache clearing** when deploying frontend changes
4. **NEVER push to production without testing on UAT first**
5. **NEVER change production database credentials**
6. **NEVER confuse UAT and Production domains:**
   - UAT: hientrangcds.mindmaid.ai
   - Production: hientrangcds.mst.gov.vn

### ✅ ALWAYS DO:
1. **ALWAYS test on UAT (https://hientrangcds.mindmaid.ai) first**
2. **ALWAYS clear Docker build cache before frontend rebuild:**
   ```bash
   docker builder prune -af
   DOCKER_BUILDKIT=0 docker compose build frontend --no-cache
   ```
3. **ALWAYS verify JS bundle filename changed after rebuild**
4. **ALWAYS use proper project names to separate Production and UAT containers**
5. **ALWAYS work via SSH** - Never deploy from local machine
6. **ALWAYS check which environment you're deploying to:**
   ```bash
   docker ps | grep frontend
   ```

---

## Deployment Workflow

```
Local Development (branch: develop)
          ↓
    Commit & Push to develop
          ↓
    Deploy to UAT
    https://hientrangcds.mindmaid.ai (port 3002)
          ↓
    Test & Verify on UAT
          ↓
    ✅ Approved?
          ↓
    Merge develop → main (or cherry-pick commits)
          ↓
    Deploy to Production
    https://hientrangcds.mst.gov.vn (port 3000)
          ↓
    Verify Production
```

---

## Test Credentials

### Organization Users
- `vu-buuchinh` / `ThongkeCDS@2026#`
- `ptit` / `ThongkeCDS@2026#`
- `vnnic` / `ThongkeCDS@2026#`

### Admin User
- `admin` / `Admin@2026`

---

## Current Status (Feb 3, 2026 - 15:00)

| Environment | Domain | Port | Status | Branch | Commit | JS Bundle | Features |
|-------------|--------|------|--------|--------|--------|-----------|----------|
| **UAT** | hientrangcds.mindmaid.ai | 3002 | ✅ Healthy | develop | fd52d6f | index-DB2RW1z2.js | NEW (with 7 improvements) |
| **Production** | hientrangcds.mst.gov.vn | 3000 | ✅ Healthy | main | a4bfbf3 | index-DotoWVP6.js | Stable (without 7 improvements) |

---

## 7 UI Improvements (Currently on UAT only)

1. ✅ Duration text position adjusted (higher, not close to bottom)
2. ✅ Sample questions default to "Show" (visible by default)
3. ✅ Voice input hidden temporarily
4. ✅ Click sample question = auto-submit query (no need to click "Hỏi AI")
5. ✅ Progress section default collapsed, click to expand, each step clickable for debug info
6. ✅ Dark mode & Export PDF buttons hidden
7. ✅ History button moved to AI input section (near "Hỏi AI về dữ liệu hệ thống")

**Test URL:** https://hientrangcds.mindmaid.ai/dashboard/strategic

---

## Quick Verification Commands

```bash
# Check which containers are running
ssh admin_@34.142.152.104 "docker ps | grep frontend"

# Check UAT JS bundle
curl -s "https://hientrangcds.mindmaid.ai" | grep -o 'index-[^"]*\.js'

# Check Production JS bundle
curl -s "https://hientrangcds.mst.gov.vn" | grep -o 'index-[^"]*\.js'

# Check UAT container
ssh admin_@34.142.152.104 "docker exec thong-ke-he-thong-uat-frontend-1 ls -la /usr/share/nginx/html/assets/"

# Check Production container
ssh admin_@34.142.152.104 "docker exec thong-ke-he-thong-frontend-1 ls -la /usr/share/nginx/html/assets/"
```

---

## Notes

- Both Production and UAT run on the same physical server (34.142.152.104)
- Separation is achieved via different docker-compose project names (`-p` flag)
- Cloudflare proxies both domains to different ports:
  - hientrangcds.mindmaid.ai → port 3002 (UAT)
  - hientrangcds.mst.gov.vn → port 3000 (Production)
- Always verify container names and ports to avoid deploying to wrong environment
- UAT and Production use separate databases (postgres and uat-postgres)
