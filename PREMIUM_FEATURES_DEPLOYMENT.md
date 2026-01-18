# Premium Features Deployment Guide

**Deployment Date:** 2026-01-18
**Version:** BETA Premium Features v1.0
**Commit:** f656034

---

## ✅ What's Being Deployed

5 BETA Premium Features:

1. **Analytics** - Intelligent Analytics & AI-Powered Insights
   - System Landscape Map
   - AI Insights Dashboard
   - Cost Forecast Chart
   - Technology Silo Detection

2. **Approvals** - Digital Approval Workflow
   - Approval Kanban Board
   - Multi-stage workflow
   - Approval timeline
   - E-Signature simulation

3. **Benchmarking** - Benchmark Database
   - Radar Chart comparisons
   - Best Practices Library
   - Case Studies
   - Metrics comparison

4. **Lifecycle** - System Lifecycle Management
   - Lifecycle Roadmap
   - Planning Pipeline
   - Budget Tracking
   - System detail modal

5. **API Catalog** - API Catalog & Integration Hub
   - API Catalog Table
   - API Health Monitoring
   - Integration Marketplace
   - API Documentation

---

## 🚀 Quick Deployment (EASIEST METHOD)

### Method 1: Using the Deployment Script

1. **SSH to production server:**
   ```bash
   ssh root@103.145.63.61
   ```

2. **Copy the deployment script to server:**
   ```bash
   # From your local machine
   scp deploy-premium-features.sh root@103.145.63.61:/root/
   ```

3. **Run the script on server:**
   ```bash
   # On the server
   cd /root
   chmod +x deploy-premium-features.sh
   ./deploy-premium-features.sh
   ```

The script will automatically:
- Pull latest code
- Rebuild frontend
- Restart containers
- Show deployment status

---

## 📋 Manual Deployment Steps

If you prefer to run commands manually:

### Step 1: SSH to Server
```bash
ssh root@103.145.63.61
# Enter password when prompted
```

### Step 2: Navigate to Project
```bash
cd /root/thong-ke-he-thong
```

### Step 3: Pull Latest Code
```bash
git pull origin main
```

Expected output:
```
Updating 771c529..f656034
Fast-forward
 57 files changed, 13385 insertions(+), 198 deletions(-)
 ... (list of changed files)
```

### Step 4: Rebuild Frontend
```bash
docker compose build frontend
```

This will take 2-3 minutes. You'll see:
```
[+] Building ... done
```

### Step 5: Restart Containers
```bash
docker compose restart
```

### Step 6: Verify Deployment
```bash
# Check container status
docker compose ps

# Check frontend logs
docker compose logs frontend --tail=30
```

All containers should show "Up" status.

---

## ✅ Verification Checklist

After deployment, test these features:

### 1. Analytics Page
- [ ] Navigate to `/analytics`
- [ ] System Landscape Graph loads
- [ ] AI Insights cards display
- [ ] Cost Forecast chart renders
- [ ] Technology Silo table shows data

### 2. Approvals Page
- [ ] Navigate to `/approvals`
- [ ] Kanban board displays
- [ ] Can view approval details
- [ ] Timeline shows correctly

### 3. Benchmarking Page
- [ ] Navigate to `/benchmarking`
- [ ] Radar chart displays
- [ ] Best practices library loads
- [ ] Case study cards show

### 4. Lifecycle Page
- [ ] Navigate to `/lifecycle`
- [ ] Roadmap timeline displays
- [ ] Planning pipeline table loads
- [ ] Budget chart renders

### 5. API Catalog Page
- [ ] Navigate to `/api-catalog`
- [ ] API catalog table shows
- [ ] API details panel works
- [ ] Health dashboard displays

---

## 🎯 Testing URLs

After deployment, access these URLs:

**Production Site:** https://thongkehethong.mindmaid.ai

**Premium Features:**
- Analytics: https://thongkehethong.mindmaid.ai/analytics
- Approvals: https://thongkehethong.mindmaid.ai/approvals
- Benchmarking: https://thongkehethong.mindmaid.ai/benchmarking
- Lifecycle: https://thongkehethong.mindmaid.ai/lifecycle
- API Catalog: https://thongkehethong.mindmaid.ai/api-catalog

**Login with:**
- Username: `admin` (or your admin account)
- Password: [your admin password]

---

## 📊 Files Changed Summary

**Total:** 57 files changed, 13,385 insertions

**New Pages:**
- `frontend/src/pages/Analytics.tsx`
- `frontend/src/pages/Approvals.tsx`
- `frontend/src/pages/Benchmarking.tsx`
- `frontend/src/pages/Lifecycle.tsx`
- `frontend/src/pages/APICatalog.tsx`

**New Components:**
- `frontend/src/components/analytics/*` (4 components)
- `frontend/src/components/approvals/*` (4 components)
- `frontend/src/components/benchmarking/*` (5 components)
- `frontend/src/components/lifecycle/*` (4 components)
- `frontend/src/components/api-catalog/*` (5 components)

**New Mock Data:**
- `frontend/src/mocks/analytics.ts`
- `frontend/src/mocks/approvals.ts`
- `frontend/src/mocks/benchmarking.ts`
- `frontend/src/mocks/lifecycle.ts`

**Modified:**
- `frontend/src/App.tsx` (added routes)
- `frontend/src/components/Layout.tsx` (added menu items)

---

## 🐛 Troubleshooting

### Issue: Build fails
**Solution:**
```bash
# Clear Docker cache and rebuild
docker compose build --no-cache frontend
```

### Issue: Frontend not showing new features
**Solution:**
```bash
# Force browser cache clear (Ctrl+Shift+R or Cmd+Shift+R)
# Or rebuild without cache
docker compose build --no-cache frontend
docker compose restart
```

### Issue: Container won't start
**Solution:**
```bash
# Check logs
docker compose logs frontend --tail=50

# If needed, restart all containers
docker compose down
docker compose up -d
```

### Issue: Menu items not showing
**Solution:**
- Clear browser cache
- Check if you're logged in as admin
- Verify Layout.tsx was updated correctly

---

## 🔄 Rollback Plan

If you need to rollback:

```bash
# SSH to server
ssh root@103.145.63.61

# Navigate to project
cd /root/thong-ke-he-thong

# Rollback to previous commit
git reset --hard 771c529

# Rebuild and restart
docker compose build frontend
docker compose restart
```

Previous stable commit: `771c529` (before premium features)

---

## 📝 Post-Deployment Notes

1. **BETA Status:**
   - All features show "BETA" badge
   - Using sample/mock data
   - Not connected to real APIs yet

2. **Performance:**
   - Bundle size: 3.78 MB (optimized in future)
   - Consider code-splitting for better performance

3. **Next Steps:**
   - Gather user feedback on premium features
   - Plan real data integration
   - Optimize bundle size
   - Add E2E tests

---

## 📞 Support

**Deployment Issues:**
- Check logs: `docker compose logs --tail=100`
- Verify containers: `docker compose ps`
- Contact: [development team]

**Feature Issues:**
- Report bugs via GitHub Issues
- Include browser console errors
- Provide steps to reproduce

---

**Deployed by:** Claude Code Agent
**Status:** ✅ Ready for Deployment
**Estimated Time:** 5-10 minutes
