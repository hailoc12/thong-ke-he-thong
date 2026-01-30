# Fix Browser Cache Issue - Deployment Guide

## Problem
User still seeing "Tổng quan" menu for org_user account because nginx was caching JavaScript files for 1 year.

## Root Cause
nginx.conf line 20-23 had:
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

This cached JS/CSS files with browsers for 1 year, preventing users from getting updated code.

## Solution
Updated nginx.conf to:
1. Disable cache for JS/CSS files (no-cache headers)
2. Keep long cache for static assets (images, fonts)
3. Disable cache for index.html

## Deployment Steps

### Option 1: Auto Deploy Script (if you have SSH key)
```bash
cd /Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong

# Copy updated nginx.conf to server
scp frontend/nginx.conf admin_@139.84.163.81:/home/admin_/apps/thong-ke-he-thong/frontend/

# SSH to server and rebuild
ssh admin_@139.84.163.81
cd /home/admin_/apps/thong-ke-he-thong
docker compose build frontend
docker compose up -d frontend
exit
```

### Option 2: Manual Steps (if SSH not working)

1. **Copy nginx.conf to server**
   - Local file: `frontend/nginx.conf`
   - Use FTP/SFTP client (FileZilla, Cyberduck) to upload to:
     `/home/admin_/apps/thong-ke-he-thong/frontend/nginx.conf`

2. **SSH to server**
   ```bash
   ssh admin_@139.84.163.81
   ```

3. **Navigate to project directory**
   ```bash
   cd /home/admin_/apps/thong-ke-he-thong
   ```

4. **Rebuild frontend container**
   ```bash
   docker compose build frontend
   ```

5. **Restart frontend container**
   ```bash
   docker compose up -d frontend
   ```

6. **Verify deployment**
   ```bash
   docker compose ps
   docker compose logs frontend --tail=50
   ```

## Verification

After deployment, test in browser:

1. **Hard Refresh** (clear cache)
   - Chrome/Edge: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
   - Firefox: `Ctrl+F5` or `Cmd+Shift+R`

2. **Check Response Headers** (F12 → Network tab)
   - Navigate to: `https://thongkehethong.mindmaid.ai`
   - Find JS file (e.g., `index-RL5Jub9O.js`)
   - Check headers should include:
     ```
     Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0
     Pragma: no-cache
     ```

3. **Test Menu Visibility**
   - Login with: `org1 / Test1234!`
   - Verify: NO "Tổng quan" menu
   - Verify: YES "Dashboard Đơn vị" menu

## Expected Result

✅ Org users will NEVER see cached JavaScript
✅ Any code changes will be immediately visible after deployment
✅ No more "hard refresh" needed for users

## Changes Made

**File**: `frontend/nginx.conf`

**Before**:
```nginx
# Static files cache
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

**After**:
```nginx
# Disable cache for JS/CSS to ensure users always get latest version
location ~* \.(js|css)$ {
    expires -1;
    add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
    add_header Pragma "no-cache";
}

# Long cache for static assets (images, fonts) only
location ~* \.(png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# SPA routing - serve index.html for all routes
location / {
    try_files $uri $uri/ /index.html;
    # Disable cache for index.html
    add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
    add_header Pragma "no-cache";
}
```

## Performance Impact

**Q: Won't disabling cache make the app slower?**

**A**: Minimal impact because:
1. JS/CSS files are typically < 1MB, load quickly over CDN
2. Browser still does conditional requests (304 Not Modified)
3. User experience is better (always latest version)
4. Images/fonts still have 1-year cache

## Alternative: Version-Based Cache Busting

If you want to enable caching but ensure users get updates:

**Option A: Add timestamp to imports** (requires build config)
**Option B: Use hash-based filenames** (Vite already does this: `index-RL5Jub9O.js`)
**Option C: Add cache control on index.html only, keep JS cached**

Current solution (no-cache) is **simplest and most reliable** for your use case.

## Rollback Plan

If issues occur, rollback to previous nginx.conf:
```bash
cd /home/admin_/apps/thong-ke-he-thong
git checkout frontend/nginx.conf
docker compose build frontend
docker compose up -d frontend
```

## Questions?

If deployment fails, check:
1. Docker daemon running: `docker ps`
2. Port 80 available: `netstat -tuln | grep :80`
3. Nginx config valid: `docker exec thong-ke-he-thong-frontend-1 nginx -t`
