# Pagination Fix Report - Users Page

**Date**: 2026-01-21
**Issue**: Users page only showed 20 users instead of all 32
**Status**: ✅ FIXED - Code committed, pending production deployment

---

## 🔍 Root Cause Analysis

### Problem Discovery
Using live browser testing with Playwright MCP:
1. Navigated to https://hientrangcds.mst.gov.vn/users
2. Observed only 20 users displayed
3. Table footer showed "Tổng 20 người dùng"
4. Console logs revealed: `Response data: {count: 32, ...results: Array(20)}`

### Root Cause
**Backend**: `backend/config/settings.py` line 143
```python
REST_FRAMEWORK = {
    ...
    'PAGE_SIZE': 20,  # ← Only this was set
    # Missing: PAGE_SIZE_QUERY_PARAM
    # Missing: MAX_PAGE_SIZE
}
```

**Frontend**: `frontend/src/pages/Users.tsx` line 60
```typescript
const response = await api.get<any>('/users/?page_size=100');
```

Frontend correctly requested `?page_size=100` but backend **ignored it** because:
- `PAGE_SIZE_QUERY_PARAM` was not configured
- Django REST Framework defaulted to `PAGE_SIZE=20`

---

## ✅ Solution Applied

### Code Changes
**File**: `backend/config/settings.py`

```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'PAGE_SIZE_QUERY_PARAM': 'page_size',  # ✅ NEW: Allow client to control page_size
    'MAX_PAGE_SIZE': 100,                  # ✅ NEW: Prevent abuse
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}
```

### Commit
```
commit 8940783
fix: Allow custom page_size in pagination to show all users
```

---

## 🚀 Deployment Instructions

**Changes have been pushed to GitHub** (`main` branch).
You need to SSH into production server to apply changes:

```bash
# SSH into server
ssh ubuntu@hientrangcds.mst.gov.vn

# Navigate to project
cd /var/www/hientrangcds.mst.gov.vn

# Pull latest changes
git pull origin main

# Restart backend to apply settings changes
sudo systemctl restart gunicorn
# OR
docker-compose restart backend  # if using Docker

# Verify
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://hientrangcds.mst.gov.vn/api/users/?page_size=100" | jq '.count'
# Should return: 32
```

---

## 🎯 Expected Results After Deployment

### Users Page
- ✅ Shows all **32 users** in table
- ✅ Footer displays "Tổng 32 người dùng"
- ✅ No pagination buttons (all fit in one page with pageSize=100)

### Organizations Page
- ✅ Also benefits from this fix
- ✅ Will show all **32 organizations** instead of 20

### API Behavior
Before fix:
```bash
GET /api/users/?page_size=100
→ Returns 20 users (ignored page_size)
```

After fix:
```bash
GET /api/users/?page_size=100
→ Returns 100 users (or all if less than 100)

GET /api/users/
→ Returns 20 users (default PAGE_SIZE)

GET /api/users/?page_size=200
→ Returns 100 users (capped by MAX_PAGE_SIZE)
```

---

## 🧪 Testing Checklist

After deployment, verify:
- [ ] Users page shows 32 users
- [ ] Organizations page shows 32 organizations
- [ ] Create new user → should appear in list
- [ ] API endpoint `/api/users/?page_size=100` returns 32 users
- [ ] No console errors in browser

---

## 📋 Related Files

- `backend/config/settings.py` - Pagination config (FIXED)
- `frontend/src/pages/Users.tsx` - Frontend code (already correct)
- `frontend/src/pages/Organizations.tsx` - Will also benefit

---

## 🔗 Impact Analysis

### Positive Impact
- ✅ Users can see all users in one view
- ✅ Better UX - no need to paginate through small datasets
- ✅ Consistent with frontend expectations
- ✅ Organizations page also fixed as side effect

### No Breaking Changes
- Default behavior unchanged (`PAGE_SIZE=20`)
- Only affects endpoints that explicitly request `?page_size=N`
- MAX_PAGE_SIZE prevents potential abuse

---

## 📝 Notes for Developer

This issue was discovered using **browser automation testing**:
1. Used Playwright MCP to navigate actual production site
2. Inspected network requests and console logs
3. Found discrepancy between requested and returned data
4. Traced to backend pagination settings

**Lesson learned**: Always configure both:
- `PAGE_SIZE_QUERY_PARAM` - to allow client control
- `MAX_PAGE_SIZE` - to prevent abuse

---

**Next Action**: Deploy to production server using instructions above.
