# Quick Fix: Excel Export 20-Row Bug

**Problem**: Excel export Sheet 3 (Danh sách HT) only shows 20 systems instead of all 77 systems.

**Root Cause**: Backend `MAX_PAGE_SIZE: 100` limit, but systems API falls back to default PAGE_SIZE: 20.

**Fix**: Increase `MAX_PAGE_SIZE` from 100 to 1000 in backend settings.

---

## Apply Fix (2 minutes)

### Step 1: Edit Backend Settings

```bash
ssh admin_@34.142.152.104
cd /home/admin_/thong_ke_he_thong
nano backend/config/settings.py
```

Find this section (around line 145-147):

```python
'PAGE_SIZE': 20,
'PAGE_SIZE_QUERY_PARAM': 'page_size',
'MAX_PAGE_SIZE': 100,  # Maximum allowed page_size to prevent abuse
```

Change to:

```python
'PAGE_SIZE': 20,
'PAGE_SIZE_QUERY_PARAM': 'page_size',
'MAX_PAGE_SIZE': 1000,  # Increased for Excel export (supports up to 1000 items)
```

Save: `Ctrl+O`, `Enter`, `Ctrl+X`

### Step 2: Restart Backend

```bash
docker compose restart backend
```

Wait ~10 seconds for backend to restart.

### Step 3: Verify

Check backend logs:
```bash
docker compose logs backend --tail=20
```

Expected output:
```
backend_1  | Django version 4.2.x, using settings 'config.settings'
backend_1  | Starting development server at http://0.0.0.0:8000/
backend_1  | Quit the server with CONTROL-C.
```

---

## Test Fix (1 minute)

1. Open browser: https://hientrangcds.mst.gov.vn
2. Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
3. Login as admin
4. Click "Xuất Excel" button
5. Download Excel file
6. Open Sheet 3 (Danh sách HT)
7. Count rows: Should be 78 rows (77 systems + 1 header)

**Previous**: 21 rows (20 systems + 1 header) ❌
**Expected**: 78 rows (77 systems + 1 header) ✅

---

## Rollback (if needed)

If any issues:

```bash
ssh admin_@34.142.152.104
cd /home/admin_/thong_ke_he_thong
nano backend/config/settings.py
```

Change back to:
```python
'MAX_PAGE_SIZE': 100,
```

Then restart:
```bash
docker compose restart backend
```

---

## Quick Commands

```bash
# One-liner to apply fix
ssh admin_@34.142.152.104 "cd /home/admin_/thong_ke_he_thong && sed -i \"s/'MAX_PAGE_SIZE': 100/'MAX_PAGE_SIZE': 1000/\" backend/config/settings.py && docker compose restart backend"

# Verify change applied
ssh admin_@34.142.152.104 "cd /home/admin_/thong_ke_he_thong && grep MAX_PAGE_SIZE backend/config/settings.py"
```

Expected output:
```
    'MAX_PAGE_SIZE': 1000,  # Increased for Excel export
```

---

**Total Time**: 3 minutes
**Risk**: Very Low (only affects pagination limits)
**Impact**: Excel export will show all systems
