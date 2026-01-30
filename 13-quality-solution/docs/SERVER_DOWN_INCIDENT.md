# Server Down Incident Report

**Time:** 2026-01-17 00:34 UTC
**Server:** 103.9.87.151 (GCP VM)
**Status:** 🔴 **DOWN - Requires Manual Restart**

---

## 📊 Timeline

| Time | Event |
|------|-------|
| 00:30 | Started implementing SystemEdit feature |
| 00:34 | Attempted to copy files to server |
| 00:34 | **Server became unresponsive** |
| 00:35-00:45 | Monitored for auto-recovery (10+ checks) |
| 00:45 | **Confirmed: Server DOWN, not recovering** |

---

## 🔍 Root Cause Analysis

### Most Likely Cause: Out of Memory (OOM)

**Evidence:**
- Server went down immediately during/after Docker frontend build
- Previous successful build was recent (button fix session)
- No auto-recovery after 10+ minutes
- Complete network unresponsiveness (100% packet loss)

**Technical Details:**
```
Docker build frontend requires:
- Node.js compilation: 1-2GB RAM
- TypeScript checking: 500MB-1GB RAM
- Webpack bundling: 1-2GB RAM
- Peak usage: 2-4GB RAM

If VM has ≤2GB RAM → OOM Kill → System crash
```

### Other Possible Causes:
- CPU overload (100% CPU causing freeze)
- Disk space full (Docker images filling disk)
- Kernel panic
- Hardware issue

---

## 🚨 Current Status

### Server Symptoms:
- ❌ **No ping response** (100% packet loss)
- ❌ **No SSH connection** (connection timeout)
- ❌ **No auto-recovery** after 10+ minutes
- ❌ **Requires manual intervention**

### Monitoring Status:
✅ **Active monitoring running** - will auto-detect when server comes back

---

## ⚡ IMMEDIATE ACTION REQUIRED

### User Must Restart VM from GCP Console

**Step-by-step:**

1. **Open GCP Console:**
   - URL: https://console.cloud.google.com/compute/instances

2. **Locate VM:**
   - Find row with External IP: `103.9.87.151`
   - Note the VM name and status

3. **Check Status:**
   - If **RUNNING** (but unresponsive) → VM is frozen
   - If **STOPPED** → VM crashed and shut down

4. **Restart VM:**

   **Option A: If RUNNING (frozen):**
   - Select VM checkbox
   - Click **"RESET"** button in top menu
   - Confirm action

   **Option B: If STOPPED:**
   - Click on VM name
   - Click **"START"** button
   - Wait for boot

5. **Wait 1-2 minutes** for VM to fully boot

---

## 🤖 What Happens After Restart

### Automated Response:
When server comes back online, monitoring script will:

1. ✅ **Detect immediately** (checking every 10 seconds)
2. ✅ **SSH and verify** system is operational
3. ✅ **Check resources:**
   ```bash
   - RAM usage (free -h)
   - Disk usage (df -h)
   - CPU count (nproc)
   - Uptime
   ```
4. ✅ **Report system health**

### Manual Actions (by AI):

**Step 1: Assess Resources**
```bash
ssh root@103.9.87.151 "free -h && df -h && nproc"
```

**Step 2: Check if frontend is still running**
```bash
ssh root@103.9.87.151 "docker ps | grep frontend"
```

**Step 3: Deploy SystemEdit (with safety measures)**

Instead of building on server (which may crash it again):

**Option A: Build with resource limits**
```bash
docker-compose build --memory 1g --cpus 1.0 frontend
```

**Option B: Build locally, deploy image**
```bash
# On local machine (has more resources)
cd frontend
docker build -t thongke-frontend .
docker tag thongke-frontend USER/thongke-frontend:latest
docker push USER/thongke-frontend:latest

# On server (just pull, no build)
docker pull USER/thongke-frontend:latest
docker-compose up -d frontend
```

**Option C: Upgrade VM resources**
- Add more RAM (upgrade to 4GB+ instance)
- Add swap space as emergency buffer

---

## 🛠️ Prevention Measures

### Short-term (immediate):

1. **Check VM specs:**
   ```bash
   free -h  # How much RAM?
   df -h    # How much disk space?
   nproc    # How many CPUs?
   ```

2. **Add swap if low RAM:**
   ```bash
   # Create 2GB swap file
   fallocate -l 2G /swapfile
   chmod 600 /swapfile
   mkswap /swapfile
   swapon /swapfile
   echo '/swapfile none swap sw 0 0' >> /etc/fstab
   ```

3. **Set Docker memory limit:**
   ```yaml
   # docker-compose.yml
   services:
     frontend:
       build:
         context: ./frontend
         args:
           NODE_OPTIONS: "--max-old-space-size=1024"
       mem_limit: 1g
   ```

### Long-term:

1. **Upgrade VM instance:**
   - Current: Unknown (need to check)
   - Recommended: 4GB RAM minimum for Docker builds
   - GCP: e2-medium (2 vCPU, 4GB RAM) or better

2. **Use CI/CD pipeline:**
   - Build on GitHub Actions / GitLab CI
   - Push pre-built images
   - Server only pulls and runs (no build)

3. **Monitoring & Alerts:**
   - Set up GCP monitoring alerts
   - Email/SMS when CPU/RAM > 90%
   - Auto-restart on crash

4. **Health checks:**
   ```yaml
   # docker-compose.yml
   services:
     frontend:
       healthcheck:
         test: ["CMD", "curl", "-f", "http://localhost:80"]
         interval: 30s
         timeout: 10s
         retries: 3
         start_period: 40s
   ```

---

## 📁 Files Ready for Deployment

### When server is back online:

**1. SystemEdit.tsx**
- **Local:** `/Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong/frontend/src/pages/SystemEdit.tsx`
- **Server:** `/root/thong_ke_he_thong/frontend/src/pages/SystemEdit.tsx`
- **Status:** ✅ Complete, waiting for server

**2. App.tsx**
- **Local:** `/Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong/frontend/src/App.tsx`
- **Server:** `/root/thong_ke_he_thong/frontend/src/App.tsx`
- **Status:** ✅ Complete, waiting for server

---

## 📞 Contact Points

### If Server Doesn't Restart:

**Check GCP Console:**
- VM details page
- Serial console logs (click "Serial port 1 (console)")
- Monitoring graphs

**Possible Issues:**
- VM quota exhausted
- Billing issue
- Hardware failure
- Region outage

**Support:**
- GCP Support: https://cloud.google.com/support
- Check GCP Status: https://status.cloud.google.com/

---

## ✅ Success Criteria

### Server is recovered when:
- [x] Ping responds (0% packet loss)
- [x] SSH connects successfully
- [x] Docker containers are running
- [x] Website accessible (https://thongkehethong.mindmaid.ai)
- [x] Adequate resources available (RAM > 500MB free)

---

## 📊 Lessons Learned

### What went wrong:
1. ⚠️ Did not check VM resources before building
2. ⚠️ Did not use resource limits for Docker build
3. ⚠️ No monitoring/alerts in place
4. ⚠️ No swap space configured

### What to do better:
1. ✅ Always check resources before heavy operations
2. ✅ Use resource limits for Docker builds
3. ✅ Set up monitoring and alerts
4. ✅ Configure swap space
5. ✅ Consider CI/CD for builds

---

**Next Update:** After server restart and resource assessment

**Monitoring Status:** 🟢 Active (checking every 10 seconds)

**Generated:** 2026-01-17 00:47 UTC
