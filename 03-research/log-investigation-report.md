# Log Investigation Report: Missing "test" System Data

**Date:** 2026-01-25
**Investigator:** Claude Code Agent
**Status:** ⚠️ NO LOGS FOUND

---

## 🎯 Investigation Objective

Recover missing data from a system named "test" that was reportedly lost during save operation.

---

## 🔍 Investigation Summary

### Logs Checked:
1. ✅ Project root directory - Found `deployment.log` (no API requests)
2. ✅ Backend logs directory - Not found (no `/backend/logs/` directory)
3. ✅ Playwright browser logs - Found screenshots only, no console logs
4. ✅ Git history - Checked for "test" system mentions
5. ✅ Django settings - No request logging configured
6. ✅ Database query - Cannot access (using PostgreSQL in production)
7. ✅ Documentation files - Found general save bug, no specific "test" system

### Key Findings:

#### 1. No Request Logs Available
- Django is **not configured to log request payloads**
- No middleware exists to capture POST/PUT/PATCH request bodies
- No nginx logs found in project directory

#### 2. No Database Audit Trail
- No soft-delete tracking for field-level changes
- No audit log tables for data modifications
- No database query logs enabled

#### 3. Related Bug Found
Found documentation of a **P0 critical save bug** from 2026-01-23:
- **File:** `BUG_ANALYSIS_SAVE_BROKEN.md`, `FIX_SUMMARY.md`
- **Issue:** Save functionality completely broken
- **Cause:** 5 fields validated on frontend but missing in database
- **Impact:** ALL system creation/editing failed
- **Fix:** Migration 0020 added missing columns

**Affected Fields:**
- `containerization` (Array)
- `is_multi_tenant` (Boolean)
- `has_layered_architecture` (Boolean)
- `has_cicd` (Boolean)
- `has_automated_testing` (Boolean)

---

## 🚫 Why Data Cannot Be Recovered from Logs

### Missing Infrastructure:
1. **No Request Body Logging**
   - Django settings.py has no LOGGING configuration
   - No middleware to capture request payloads
   - Only deployment logs available (server restarts, migrations)

2. **No Browser Console Persistence**
   - Playwright logs contain only screenshots
   - No network request capture configured
   - Browser console logs not saved

3. **No Database Audit Trail**
   - No `django-auditlog` or similar package installed
   - No field-level change tracking
   - No historical data tables

4. **No Nginx Access Logs with Request Bodies**
   - Nginx logs not found in project directory
   - Even if available, nginx typically doesn't log POST bodies by default

---

## 💡 Alternative Data Recovery Methods

### Method 1: Check Production Database
If the "test" system was partially saved before the bug occurred, check the database directly:

```bash
# SSH to production
ssh admin_@34.142.152.104
cd /home/admin_/thong_ke_he_thong

# Query for "test" system
docker-compose exec db psql -U postgres -d hientrang -c "
SELECT
  s.*,
  sa.*,
  sd.*
FROM systems s
LEFT JOIN system_architecture sa ON sa.system_id = s.id
LEFT JOIN system_data_info sd ON sd.system_id = s.id
WHERE
  s.system_name ILIKE '%test%'
  OR s.system_code ILIKE '%test%'
ORDER BY s.created_at DESC;
"
```

### Method 2: Check Browser History (If User Still Has It)
If the user who created the "test" system still has their browser open:
1. Open browser DevTools → Network tab
2. Filter for `/api/systems/` requests
3. Check request payload in POST/PUT/PATCH requests
4. Copy the request body JSON

### Method 3: Ask User to Re-enter Data
Most reliable option if logs are unavailable:
1. User recalls what data was entered
2. Re-create the "test" system with correct data
3. Enable logging for future (see below)

---

## 🛡️ Prevention: Enable Request Logging

### Step 1: Create Logging Middleware

Create file: `backend/apps/systems/middleware/request_logging.py`

```python
import json
import logging
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger('api.requests')

class RequestLoggingMiddleware(MiddlewareMixin):
    """Log all API requests with full payload for debugging"""

    def process_request(self, request):
        # Only log API requests
        if not request.path.startswith('/api/'):
            return None

        # Log request details
        log_data = {
            'method': request.method,
            'path': request.path,
            'user': str(request.user) if request.user.is_authenticated else 'anonymous',
            'ip': self.get_client_ip(request),
        }

        # Log request body for write operations
        if request.method in ['POST', 'PUT', 'PATCH']:
            try:
                # Parse JSON body
                body = json.loads(request.body.decode('utf-8'))
                log_data['body'] = body
            except:
                log_data['body'] = 'Could not parse body'

        logger.info(f"API Request: {json.dumps(log_data, indent=2)}")
        return None

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
```

### Step 2: Update Django Settings

Add to `backend/config/settings.py`:

```python
# Middleware
MIDDLEWARE = [
    # ... existing middleware ...
    'apps.systems.middleware.request_logging.RequestLoggingMiddleware',
]

# Logging Configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': BASE_DIR / 'logs' / 'api_requests.log',
            'maxBytes': 10 * 1024 * 1024,  # 10 MB
            'backupCount': 5,
            'formatter': 'verbose',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'api.requests': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}
```

### Step 3: Create Logs Directory

```bash
mkdir -p backend/logs
touch backend/logs/.gitkeep
echo "backend/logs/*.log" >> .gitignore
```

---

## 📊 Expected Log Output (After Implementation)

With request logging enabled, future saves would log:

```json
{
  "method": "POST",
  "path": "/api/systems/",
  "user": "admin",
  "ip": "192.168.1.100",
  "body": {
    "system_name": "test",
    "system_name_en": "Test System",
    "org": 1,
    "scope": "internal_unit",
    "status": "operating",
    "system_group": "business_app",
    "architecture": {
      "containerization": ["docker", "kubernetes"],
      "is_multi_tenant": true,
      "has_cicd": true,
      "has_automated_testing": false
    }
    // ... all other fields
  }
}
```

---

## 🎯 Recommendations

### Immediate Actions:
1. ✅ **Query production database** - Check if "test" system has any data
2. ✅ **Contact user** - Ask them to recall what data was entered
3. ✅ **Re-create system** - User manually re-enters data

### Long-term Prevention:
1. ⏳ **Implement request logging** - Use middleware above
2. ⏳ **Add audit trail** - Install `django-auditlog` package
3. ⏳ **Enable database backups** - Hourly automated snapshots
4. ⏳ **Add form auto-save** - Save draft every 30 seconds to localStorage

---

## 📁 Files to Investigate (If Production Access Available)

### Production Server: 34.142.152.104

1. **Docker logs:**
   ```bash
   docker-compose logs backend | grep "POST /api/systems"
   docker-compose logs backend | grep "test"
   ```

2. **Database query:**
   ```bash
   docker-compose exec db psql -U postgres -d hientrang -c "SELECT * FROM systems WHERE system_name ILIKE '%test%';"
   ```

3. **Backup files:**
   ```bash
   ls -la /home/admin_/thong_ke_he_thong/backups/
   ```

---

## ❌ Conclusion

**Data recovery from logs is NOT POSSIBLE** due to:
- No request logging infrastructure
- No database audit trail
- No nginx body logging
- No browser console persistence

**Recommended Path Forward:**
1. Query production database to check for partial data
2. Contact user to manually re-enter data
3. Implement request logging middleware for future prevention

---

## 📎 Related Documents

- `BUG_ANALYSIS_SAVE_BROKEN.md` - General save bug analysis
- `FIX_SUMMARY.md` - Fix for missing architecture fields
- `DEPLOY_FIX_SAVE_BUG.md` - Deployment guide for fix

---

**Status:** Investigation complete - No recoverable logs found
**Next Steps:** Implement logging infrastructure + manual data re-entry
