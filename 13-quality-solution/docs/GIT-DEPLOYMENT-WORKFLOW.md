# 🚀 Git Deployment Workflow - Best Practices

**Date:** 2026-01-25
**Status:** MANDATORY - Apply to ALL code changes

---

## 🎯 Core Principles

### ⚠️ CRITICAL RULES - NEVER VIOLATE

1. **✅ ALWAYS commit after code changes**
   - Every code update must be committed to git
   - No exceptions, even for "small changes"

2. **✅ ALWAYS use Git for deployment**
   - Push to GitHub first
   - Pull on server second
   - Deploy from pulled code

3. **❌ NEVER copy code from local to production**
   - NO `scp` of source files
   - NO manual file uploads
   - NO copy-paste between environments

---

## 📋 Standard Workflow

### Phase 1: Local Development

```bash
# 1. Make code changes
vim frontend/src/pages/SystemEdit.tsx

# 2. Test locally
npm run dev

# 3. Commit immediately after changes
git add frontend/src/pages/SystemEdit.tsx
git commit -m "feat: Add transformAPIResponseToFormValues function

- Transform nested API response to flat form values
- Fix form not displaying data on edit
- Add proper date field handling

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# 4. Push to GitHub
git push origin main
```

**✅ DO:**
- Commit after each logical change
- Write clear, descriptive commit messages
- Test before committing

**❌ DON'T:**
- Wait until "everything is done" to commit
- Make commits without testing
- Skip git and copy files directly

---

### Phase 2: Server Deployment

```bash
# Connect to production server
ssh admin_@34.142.152.104

# Navigate to project
cd /home/admin_/thong_ke_he_thong

# STEP 1: Stash any local changes on server
git stash

# STEP 2: Pull latest code from GitHub
git pull origin main

# STEP 3: Verify code was pulled
git log --oneline -3

# STEP 4: Deploy (rebuild containers)
# For frontend:
cd frontend
docker build -t thong_ke_he_thong-frontend:latest .
docker stop $(docker ps -q --filter "name=frontend")
docker rm $(docker ps -aq --filter "name=frontend")
docker run -d --name thong_ke_he_thong-frontend-1 \
  --network thong_ke_he_thong_default \
  -p 3000:80 --restart always \
  thong_ke_he_thong-frontend:latest

# For backend:
cd /home/admin_/thong_ke_he_thong/backend
docker restart $(docker ps -q --filter "name=backend")

# STEP 5: Verify deployment
docker ps
curl -I http://localhost:3000/
```

**✅ DO:**
- Always pull before deploying
- Verify code with `git log`
- Test after deployment

**❌ DON'T:**
- Build from stale code
- Skip verification steps
- Assume deployment worked

---

### Phase 3: Verification

```bash
# Check container status
docker ps --format "table {{.Names}}\t{{.Status}}"

# Check logs for errors
docker logs thong_ke_he_thong-frontend-1 --tail=50
docker logs thong_ke_he_thong-backend-1 --tail=50

# Test API endpoints
curl http://localhost:8000/api/systems/115/

# Test frontend
curl -I http://localhost:3000/
```

---

## 🚨 Common Mistakes & How to Avoid

### ❌ Mistake 1: Copying Files with SCP

**Wrong:**
```bash
# Local machine
scp SystemEdit.tsx admin_@server:/path/to/file  # ❌ NEVER DO THIS
```

**Right:**
```bash
# Local machine
git add SystemEdit.tsx
git commit -m "fix: Update SystemEdit"
git push origin main

# Server
git pull origin main
# Then rebuild
```

**Why wrong?**
- Bypasses version control
- No history of changes
- Can't rollback if issues occur
- Team can't see what changed

---

### ❌ Mistake 2: Not Committing Small Changes

**Wrong:**
```bash
# Makes 5 small changes but doesn't commit
vim file1.tsx
vim file2.tsx
vim file3.tsx
# Copy to server with scp  # ❌
```

**Right:**
```bash
vim file1.tsx
git add file1.tsx
git commit -m "fix: Issue A"
git push

vim file2.tsx
git add file2.tsx
git commit -m "feat: Feature B"
git push

# On server: git pull before each deployment
```

**Why wrong?**
- Loses track of what changed when
- Can't identify which change broke something
- No atomic rollback capability

---

### ❌ Mistake 3: Building from Old Source

**Wrong:**
```bash
# Server has old code
docker build -t app:latest .  # ❌ Builds old code
```

**Right:**
```bash
git pull origin main  # ✅ Get latest first
docker build -t app:latest .  # ✅ Now builds correct code
```

**Why wrong?**
- Deploys outdated code
- Wastes time debugging "fixed" issues
- Creates confusion about what's in production

---

## 📝 Commit Message Guidelines

### Good Commit Messages

```
feat: Add transformAPIResponseToFormValues to SystemEdit

- Transform nested API response (architecture, data_info) to flat form
- Fix issue where edit form showed empty fields despite API returning data
- Add date field handling for warranty_end_date, maintenance_end_date

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

### Bad Commit Messages

```
fix stuff          # ❌ Too vague
update             # ❌ No context
asdf               # ❌ Meaningless
wip                # ❌ Never commit WIP to main
```

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring
- `docs`: Documentation
- `style`: Formatting, semicolons
- `test`: Adding tests
- `chore`: Maintenance

---

## 🔄 Rollback Procedure

If deployment breaks production:

```bash
# On server
cd /home/admin_/thong_ke_he_thong

# Find last working commit
git log --oneline -10

# Rollback to previous commit
git checkout <previous-commit-hash>

# Rebuild and restart
docker build -t app:latest .
docker restart <container>

# After fixing issue locally
git checkout main
git pull origin main
# Deploy fix
```

---

## 📊 Deployment Checklist

### Before Deployment

- [ ] All changes committed locally
- [ ] All tests passing
- [ ] Code pushed to GitHub
- [ ] Commit message is clear

### During Deployment

- [ ] SSH to server
- [ ] Navigate to project directory
- [ ] Stash any local changes: `git stash`
- [ ] Pull latest code: `git pull origin main`
- [ ] Verify pulled code: `git log -3`
- [ ] Build containers from fresh code
- [ ] Restart services
- [ ] Check container status: `docker ps`

### After Deployment

- [ ] Test API endpoints
- [ ] Check frontend loads
- [ ] Review logs for errors
- [ ] Verify fix/feature works
- [ ] Monitor for 5-10 minutes

---

## 🎓 Learning from Today's Issue

### What Went Wrong

1. Uploaded compiled JavaScript directly via SCP
2. Later rebuilt container from old source code
3. Production deployed old code despite "fix" being uploaded

### Root Cause

- Bypassed Git workflow
- Source code on server was stale
- Docker built from source, not from uploaded file

### Correct Approach

1. Edit source: `frontend/src/pages/SystemEdit.tsx`
2. Commit: `git commit -m "fix: Add transform function"`
3. Push: `git push origin main`
4. Server pull: `git pull origin main`
5. Server rebuild: `docker build` (builds from fresh source)
6. Deploy: `docker run`

### Result

✅ Source code is latest
✅ Build uses correct code
✅ Can rollback if needed
✅ Team sees all changes
✅ Production matches git history

---

## 🛠️ Emergency Hotfix Workflow

For critical production bugs:

```bash
# Local - Create hotfix branch
git checkout -b hotfix/critical-bug-name
# Fix the bug
git add .
git commit -m "hotfix: Fix critical production issue"
git push origin hotfix/critical-bug-name

# Merge to main immediately
git checkout main
git merge hotfix/critical-bug-name
git push origin main

# Server - Deploy immediately
ssh admin_@server
cd /path/to/project
git pull origin main
# Rebuild & restart
```

**Even in emergencies:** Use Git, don't copy files!

---

## 📖 Reference Commands

### Most Common Workflow

```bash
# === LOCAL ===
# 1. Edit code
# 2. Test
# 3. Commit
git add <files>
git commit -m "type: Description"
git push origin main

# === SERVER ===
# 4. Pull
ssh admin_@server
cd /path/to/project
git stash
git pull origin main

# 5. Deploy
docker build -t image:latest .
docker restart container
# OR rebuild container completely

# 6. Verify
docker ps
docker logs container --tail=50
```

---

## ✅ Summary - Golden Rules

| Rule | Why |
|------|-----|
| **Commit after every code change** | Version control, history, rollback capability |
| **Push before deploying** | Single source of truth, team visibility |
| **Pull on server before building** | Ensures latest code is deployed |
| **Never SCP source files** | Bypasses version control, loses history |
| **Always verify deployment** | Catch issues early |

**Remember:**
> "If it's not in Git, it doesn't exist."
> "If you didn't pull, you're deploying old code."

---

**Last Updated:** 2026-01-25
**Applies To:** All environments (dev, staging, production)
**Violations:** Report to team lead immediately
