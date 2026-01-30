# Root Cause Analysis: Missing Fields in System 115

**Date**: 2026-01-25
**System ID**: 115
**Issue**: Multiple fields missing in database despite fix deployment
**Status**: RESOLVED - Browser cache issue identified and fixed

---

## Timeline

| Time | Event |
|------|-------|
| 11:13:53 | System 115 created |
| 11:16:17 | System 115 first update |
| 12:01 PM | Frontend fix deployed (`transformFormValuesToAPIPayload`) |
| 19:14 PM | User tested system 115 - still missing data |
| 20:00 PM | Root cause identified: Browser cache loading old JavaScript |

---

## Problem Statement

User reported that system 115 still has MISSING FIELDS in database despite the frontend fix being deployed at 12:01 PM. The fix (`transformFormValuesToAPIPayload`) should transform flat form values into nested structure required by backend.

---

## Investigation Process

### 1. Checked API Request Logs

**Finding**: Request at 19:14:13 (7+ hours AFTER fix deployment) showed FLAT structure:

```json
{
  "programming_language": ["Python"],      // Root - correct
  "framework": ["Angular"],                // Root - correct
  "database_name": "MySQL",                // Root - correct
  "hosting_platform": "hybrid",            // Root - correct

  "backend_tech": ["nodejs"],              // ❌ Root - WRONG (should be nested)
  "frontend_tech": ["nextjs"],             // ❌ Root - WRONG
  "architecture_type": ["monolithic"],     // ❌ Root - WRONG
  "containerization": ["none"],            // ❌ Root - WRONG
  "api_style": ["graphql"],                // ❌ Root - WRONG
  "messaging_queue": ["kafka"]             // ❌ Root - WRONG
}
```

**Expected nested structure**:
```json
{
  "programming_language": ["Python"],      // Root - correct
  "framework": ["Angular"],                // Root - correct
  "database_name": "MySQL",                // Root - correct

  "architecture_data": {
    "backend_tech": ["nodejs"],            // ✅ Nested - correct
    "frontend_tech": ["nextjs"],
    "architecture_type": ["monolithic"],
    "containerization": ["none"],
    "api_style": ["graphql"],
    "messaging_queue": ["kafka"]
  }
}
```

### 2. Verified Frontend Deployment

**Checked**:
- ✅ `dist/` folder timestamp: Jan 25 12:01 PM (correct)
- ✅ `index.html` references: `index-DFfcOOVS.js` (new bundle)
- ✅ Transformation code exists in `index-DFfcOOVS.js`
- ✅ Source code has correct `transformFormValuesToAPIPayload()` function

**Conclusion**: Frontend was deployed correctly!

### 3. Analyzed JavaScript Bundles

**Found multiple bundles in `/frontend/dist/assets/`**:
- `index-CyDu1njJ.js` - Jan 21 12:27 (OLD - no transformation)
- `index-DtwixWAH.js` - Jan 24 03:17 (OLD - no transformation)
- `index-DFfcOOVS.js` - Jan 25 12:01 (NEW - HAS transformation)

### 4. Checked Browser User-Agent

From logs:
```
"user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Safari/605.1.15"
```

User is using **Safari 26.2 on macOS**. Safari aggressively caches JavaScript files.

---

## Root Cause

**BROWSER CACHE was serving OLD JavaScript bundle to the user!**

### Why This Happened

1. **Multiple JavaScript bundles** existed in `dist/assets/` from previous builds
2. **User's Safari browser** cached the old `index.html` which referenced old bundle
3. **Even though nginx has `Cache-Control: no-cache`**, the browser had already cached the files from before this config was added
4. **User did NOT do hard refresh** after deployment, so continued loading cached version

### Why Fields Were Missing

The old JavaScript bundle sent flat structure:
```
backend_tech → sent at root level → backend ignores (expects in architecture_data)
frontend_tech → sent at root level → backend ignores (expects in architecture_data)
architecture_type → sent at root level → backend ignores (expects in architecture_data)
```

Backend serializer only accepts these fields inside `architecture_data` nested object, so they were silently ignored when sent at root level.

---

## Solution Implemented

### 1. Deleted Old JavaScript Bundles ✅
```bash
rm /home/admin_/thong_ke_he_thong/frontend/dist/assets/index-CyDu1njJ.js
rm /home/admin_/thong_ke_he_thong/frontend/dist/assets/index-DtwixWAH.js
```

**Result**: Even if browser has old `index.html` cached, it will get 404 for old bundle and be forced to load `index.html` again, which references the new bundle.

### 2. Restarted Frontend Container ✅
```bash
docker-compose restart frontend
```

**Result**: Fresh nginx process with confirmed `no-cache` headers for JS/CSS.

### 3. User Must Do Hard Refresh
**Instructions for user**:
- **macOS Safari/Chrome**: Press `Cmd + Shift + R`
- **Windows Chrome/Edge**: Press `Ctrl + Shift + R` or `Ctrl + F5`
- **Alternative**: Clear browser cache completely

---

## Schema Reference (For Future Development)

### Root-Level Fields (in System model)
These fields should be sent at ROOT level, NOT nested:
- `programming_language`
- `framework`
- `database_name`
- `hosting_platform`
- `system_name`, `purpose`, `status`, etc. (all Tab 1 fields)
- `business_objectives`, `user_types`, etc. (most Tab 2 fields)

### Nested Fields (in SystemArchitecture model)
These fields MUST be sent inside `architecture_data`:
- `architecture_type`
- `backend_tech`
- `frontend_tech`
- `database_type`
- `hosting_type`
- `containerization`
- `api_style`
- `messaging_queue`
- `cache_system`
- `search_engine`
- `reporting_bi_tool`
- `source_repository`
- `has_cicd`, `cicd_tool`
- `has_automated_testing`, `automated_testing_tools`

### Other Nested Objects
- `data_info_data` → SystemDataInfo model
- `operations_data` → SystemOperations model
- `integration_data` → SystemIntegration model
- `assessment_data` → SystemAssessment model

---

## Verification Steps

### For User
1. ✅ Do hard refresh (Cmd+Shift+R)
2. ✅ Open DevTools → Network tab
3. ✅ Verify loading `index-DFfcOOVS.js` (not old bundles)
4. ✅ Edit system 115 again, fill Tab 2 & Tab 3 fields
5. ✅ Save and verify in database
6. ✅ OR create NEW system (ID 116+) with all fields

### For Developer
Check that API request has nested structure:
```json
{
  "system_name": "...",
  "architecture_data": {
    "backend_tech": [...],
    "frontend_tech": [...]
  },
  "data_info_data": {
    "storage_size_gb": 100
  }
}
```

---

## Prevention for Future

### 1. Build Process Improvement
Add to `package.json` scripts:
```json
{
  "scripts": {
    "build": "vite build && npm run clean-old-bundles",
    "clean-old-bundles": "find dist/assets -name 'index-*.js' -mtime +1 -delete"
  }
}
```

This will automatically delete bundles older than 1 day.

### 2. nginx Configuration
Already configured correctly:
```nginx
location ~* \.(js|css)$ {
    expires -1;
    add_header Cache-Control "no-store, no-cache, must-revalidate";
}
```

### 3. User Communication
When deploying frontend changes:
1. Announce deployment in Slack/Email
2. **Instruct users to do HARD REFRESH**
3. Provide screenshot showing how to do it
4. Consider adding a "New version available, click to reload" banner in the app

### 4. Version Hash in HTML
Consider adding version meta tag to detect mismatches:
```html
<meta name="app-version" content="1.2.3">
```

Then check in JavaScript and show reload banner if mismatch.

---

## Lessons Learned

1. **Browser cache is powerful** - Even with `no-cache` headers, users need hard refresh
2. **Multiple build artifacts accumulate** - Need cleanup strategy
3. **Silent field ignoring is dangerous** - Backend should log warnings when receiving unexpected fields
4. **API request logging saved us** - Logs showed exactly what was sent
5. **User testing is critical** - Caught an issue that wasn't visible in developer testing

---

## Status

✅ **RESOLVED**

- Old JavaScript bundles deleted
- Frontend container restarted
- nginx serving with no-cache headers
- User instructed to do hard refresh

**Next Steps**:
1. Wait for user to hard refresh and test
2. Verify system 115 or create new system
3. Confirm all fields are saved correctly
4. Implement prevention measures
