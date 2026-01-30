# Server Recovery Guide - 34.142.152.104

## Current Status (2026-01-26)
- Server IP: 34.142.152.104
- SSH (Port 22): ❌ Connection refused
- Web (Port 80): ❌ 502 Bad Gateway
- Nginx: Running (returning 502 errors)
- Backend/SSH Services: Down

## Root Cause Analysis
502 Bad Gateway means:
- Nginx is running
- But cannot connect to backend (Django/FastAPI)
- SSH service is also down

This indicates the Docker services may have crashed or the server needs restart.

## Recovery Options

### Option 1: Cloud Console Recovery (Recommended)
If this is a GCP/AWS/DigitalOcean server:

1. **Access via Cloud Console**
   - Go to your cloud provider console (GCP Compute Engine, AWS EC2, etc.)
   - Find the instance: 34.142.152.104
   - Click "Connect" or "Open in browser" (SSH in browser)

2. **Once connected, run:**
   ```bash
   cd ~/thong_ke_he_thong

   # Check Docker status
   docker compose ps

   # Restart all services
   docker compose restart

   # If that doesn't work, rebuild
   docker compose down
   docker compose up -d

   # Check SSH service
   sudo systemctl status ssh
   sudo systemctl restart ssh
   ```

### Option 2: Contact Hosting Provider
If you can't access cloud console:
- Contact hosting support
- Request: "Please restart SSH service on server 34.142.152.104"

### Option 3: Wait for Auto-Recovery
Some cloud providers have auto-recovery features that may restore services.

## Once SSH is Restored

### Step 1: Apply the Pagination Fix
```bash
cd ~/thong_ke_he_thong

# Edit frontend/src/pages/Dashboard.tsx
nano frontend/src/pages/Dashboard.tsx

# Find line ~110 and change:
# FROM: const response = await api.get('/organizations/');
# TO:   const response = await api.get('/organizations/?page_size=1000');
```

### Step 2: Rebuild Frontend
```bash
docker builder prune -af
DOCKER_BUILDKIT=0 docker compose build frontend --no-cache
docker compose up -d frontend
```

### Step 3: Verify
```bash
docker compose ps
curl http://localhost/
```

## Pending Deployment
The fix for Excel export to show all 32 organizations is ready:
- Local file: `frontend/src/pages/Dashboard.tsx` (already updated)
- Deployment script: `deploy-orgs-pagination-fix.sh`
- Documentation: `ORGANIZATIONS-PAGINATION-FIX.md`

## Temporary Workaround
While SSH is down, users can:
1. Use the backend API directly: `curl http://34.142.152.104/api/organizations/?page_size=1000`
2. Access the system via backup/alternate URL if configured

## Prevention
To prevent future SSH lockouts:
1. Set up SSH key authentication
2. Enable fail2ban to prevent brute force attacks
3. Configure cloud firewall to allow your IP
4. Set up monitoring alerts for service downtime
