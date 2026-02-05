# Quick Deployment Guide - Interactive Visualization Feature

## Prerequisites
- SSH access to UAT server: `ssh admin_@34.142.152.104`
- Git credentials configured
- Docker access

## Deployment Steps

### 1. Connect to Server
```bash
ssh admin_@34.142.152.104
cd /home/admin_/apps/thong-ke-he-thong-uat
```

### 2. Pull Latest Code
```bash
git status  # Check current state
git stash   # If needed
git pull origin develop
git log -1  # Verify latest commit
```

### 3. Deploy Backend
```bash
# Backend changes are in views.py, no DB migration needed
docker compose restart backend

# Verify backend is running
docker compose ps
docker compose logs backend --tail=50
```

### 4. Deploy Frontend
```bash
# CRITICAL: Clear build cache first!
docker builder prune -af

# Build with BuildKit disabled (ensures fresh build)
DOCKER_BUILDKIT=0 docker compose build frontend --no-cache

# Deploy
docker compose up -d frontend

# Verify
docker compose ps
```

### 5. Verify Deployment

#### Check File Hashes (ensure new code is deployed)
```bash
# Check JS bundle hash changed
docker compose exec frontend ls -la /usr/share/nginx/html/assets/ | grep '\.js$'

# Check backend code is updated
docker compose exec backend grep -n "generate_visualization" /app/apps/systems/views.py | head -1
```

#### Test Functionality
1. Open browser: http://34.142.152.104
2. Login with test credentials
3. Navigate to Strategic Dashboard
4. Open AI Assistant
5. Test queries:
   - "Danh sách hệ thống" → Should show interactive table
   - "Đơn vị nào có nhiều hệ thống nhất?" → Should show bar chart
   - Click system name in table → Should navigate to detail page
6. Check browser console → No errors

### 6. Rollback (if needed)
```bash
git log -5  # Find previous commit
git reset --hard <previous-commit-hash>

docker compose restart backend
docker builder prune -af
DOCKER_BUILDKIT=0 docker compose build frontend --no-cache
docker compose up -d frontend
```

## Quick Test Commands

### Test Visualization Generation (Backend)
```bash
docker compose exec backend python3 /app/test_visualization_simple.py
# Should show: "Results: 5 passed, 0 failed"
```

### Check Backend Logs
```bash
docker compose logs backend -f | grep -i "visualization\|error"
```

### Check Frontend Logs
```bash
docker compose logs frontend --tail=50
```

## Common Issues

### Issue: Old code still showing
**Solution:**
```bash
# Force rebuild
docker builder prune -af
docker compose down
docker system prune -af
DOCKER_BUILDKIT=0 docker compose build frontend --no-cache --pull
docker compose up -d
```

### Issue: Backend error "generate_visualization not found"
**Solution:**
```bash
# Verify code was pulled
git status
git diff origin/develop

# Force restart
docker compose down
docker compose up -d backend
docker compose logs backend --tail=100
```

### Issue: Visualization not rendering
**Check:**
1. Browser console errors
2. Network tab → Check Chart.js loaded
3. Backend response → Verify `visualization` field present

## Success Criteria
- ✓ Backend restarts without errors
- ✓ Frontend JS hash changed
- ✓ AI Assistant shows visualizations
- ✓ Links in tables navigate correctly
- ✓ No console errors
- ✓ All chart types render (table, bar, pie, line)

## Monitoring
After deployment, monitor for 30 minutes:
```bash
# Watch logs
docker compose logs -f backend frontend

# Check error rate
docker compose logs backend | grep -i error | wc -l
docker compose logs frontend | grep -i error | wc -l
```

## Support
If issues occur:
1. Check logs first
2. Test with simple query: "Có bao nhiêu hệ thống?"
3. Rollback if critical
4. Report issues with:
   - Query that failed
   - Browser console errors
   - Backend logs excerpt

## Estimated Time
- Pull code: 30 seconds
- Backend restart: 30 seconds
- Frontend rebuild: 2-3 minutes
- Testing: 5 minutes
- **Total: ~8 minutes**

## Post-Deployment
1. Update UAT_AI_ASSISTANT_TEST_REPORT.md with visualization test results
2. Notify stakeholders of new feature
3. Gather feedback from users
4. Monitor performance metrics
