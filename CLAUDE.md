# Project Guidelines for Claude Code

## Critical Rules - Production Testing

### NEVER Change User Passwords
**TUYỆT ĐỐI KHÔNG được thay đổi password của user hiện có trên production.**

When testing on production:
1. Use existing credentials that are known to work
2. If login fails, try different known accounts (from documentation/test files)
3. Ask user for correct credentials if needed
4. **NEVER run `set_password()` or similar commands on production users**

### Test Credentials Reference
Known test accounts (from project documentation):
- `vu-buuchinh` / `ThongkeCDS@2026#` (org user)
- `ptit` / `ThongkeCDS@2026#` (org user)
- `vnnic` / `ThongkeCDS@2026#` (org user)
- `admin` / `Admin@2026` (admin user)

### Server Access
- Production: `ssh admin_@34.142.152.104`
- Project path: `/home/admin_/apps/thong-ke-he-thong`

## Deployment Guidelines

### Frontend Deployment
Always clear Docker build cache to ensure new code is deployed:
```bash
docker builder prune -af
DOCKER_BUILDKIT=0 docker compose build frontend --no-cache
docker compose up -d frontend
```

### Verify Deployment
Check JS file hash changed after rebuild:
```bash
docker compose exec frontend ls -la /usr/share/nginx/html/assets/ | grep '\.js$'
```

### Backend Changes
For serializer/model changes, restart backend:
```bash
docker compose restart backend
```
