# Logging Setup Guide: Prevent Data Loss

**Purpose:** Enable comprehensive request logging to prevent data loss and enable recovery
**Created:** 2026-01-25
**Priority:** HIGH - Prevents future incidents

---

## 🎯 Why You Need This

**Current Problem:**
- No logs of API requests/responses
- Cannot recover data if save fails
- No audit trail for debugging
- Lost "test" system data cannot be recovered

**After Implementation:**
- ✅ All API requests logged with full payload
- ✅ Can recover data from logs if save fails
- ✅ Complete audit trail for security
- ✅ Easy debugging of production issues

---

## 📦 Installation Steps

### Step 1: Create Middleware Directory

```bash
cd /Users/shimazu/Dropbox/9.\ active/consultant/support_b4t/thong_ke_he_thong/backend

# Create middleware package
mkdir -p apps/systems/middleware
touch apps/systems/middleware/__init__.py
```

### Step 2: Copy Middleware File

```bash
# Copy the logging middleware
cp /Users/shimazu/Dropbox/9.\ active/consultant/support_b4t/thong_ke_he_thong/14-automated-solution/request_logging_middleware.py \
   backend/apps/systems/middleware/
```

### Step 3: Create Logs Directory

```bash
# Create logs directory
mkdir -p backend/logs
touch backend/logs/.gitkeep

# Prevent log files from being committed to git
echo "backend/logs/*.log" >> .gitignore
```

### Step 4: Update Django Settings

Edit `backend/config/settings.py`:

#### 4a. Add Middleware

Find the `MIDDLEWARE` list and add:

```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',

    # ADD THIS LINE:
    'apps.systems.middleware.request_logging.RequestLoggingMiddleware',
]
```

#### 4b. Add Logging Configuration

Add at the end of `settings.py`:

```python
# ================================================================
# LOGGING CONFIGURATION
# ================================================================
import os

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,

    # Formatters
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },

    # Handlers
    'handlers': {
        # File handler for API requests
        'api_requests_file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': BASE_DIR / 'logs' / 'api_requests.log',
            'maxBytes': 50 * 1024 * 1024,  # 50 MB per file
            'backupCount': 10,  # Keep 10 backup files
            'formatter': 'verbose',
        },

        # Console handler for development
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },

        # File handler for errors
        'error_file': {
            'level': 'ERROR',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': BASE_DIR / 'logs' / 'errors.log',
            'maxBytes': 10 * 1024 * 1024,  # 10 MB
            'backupCount': 5,
            'formatter': 'verbose',
        },
    },

    # Loggers
    'loggers': {
        # API request logger
        'api.requests': {
            'handlers': ['api_requests_file', 'console'],
            'level': 'INFO',
            'propagate': False,
        },

        # Django errors
        'django': {
            'handlers': ['error_file', 'console'],
            'level': 'ERROR',
            'propagate': False,
        },

        # Database queries (enable for debugging)
        # 'django.db.backends': {
        #     'handlers': ['console'],
        #     'level': 'DEBUG',
        #     'propagate': False,
        # },
    },
}
```

### Step 5: Test Locally

```bash
cd backend

# Run migrations (if needed)
python manage.py migrate

# Start development server
python manage.py runserver

# Test logging
# 1. Open http://localhost:8000/api/systems/
# 2. Create a test system
# 3. Check logs/api_requests.log
tail -f logs/api_requests.log
```

**Expected output in log:**
```json
{
  "timestamp": "2026-01-25T10:30:00",
  "method": "POST",
  "path": "/api/systems/",
  "user": "admin",
  "body": {
    "system_name": "Test System",
    "org": 1,
    // ... full payload
  }
}
```

### Step 6: Deploy to Production

```bash
# Commit changes
git add backend/apps/systems/middleware/
git add backend/config/settings.py
git add backend/logs/.gitkeep
git add .gitignore

git commit -m "feat: Add request logging middleware for data recovery

- Add RequestLoggingMiddleware to log all API requests
- Configure rotating file handler (50MB, 10 backups)
- Log full request payloads for POST/PUT/PATCH
- Enable data recovery from logs
- Add error logging for debugging

Prevents: Data loss incidents like missing 'test' system
Enables: Recovery from logs if save fails
"

git push origin main

# Deploy on production
ssh admin_@34.142.152.104
cd /home/admin_/thong_ke_he_thong

git pull origin main

# Create logs directory on production
mkdir -p backend/logs
chmod 755 backend/logs

# Restart backend
docker-compose restart backend

# Verify logging works
docker-compose logs -f backend
# Create test system and check logs
docker-compose exec backend cat logs/api_requests.log
```

---

## 🔍 Using Logs for Data Recovery

### Scenario: User reports lost data

#### Step 1: Find the request in logs

```bash
# SSH to production
ssh admin_@34.142.152.104
cd /home/admin_/thong_ke_he_thong

# Search for system by name
docker-compose exec backend grep -i "test" logs/api_requests.log

# Or search for recent systems
docker-compose exec backend tail -100 logs/api_requests.log | grep "🔥 SYSTEM_DATA 🔥"
```

#### Step 2: Extract data using recovery script

```bash
# Copy log file to local machine
scp admin_@34.142.152.104:/home/admin_/thong_ke_he_thong/backend/logs/api_requests.log .

# Run recovery script
python 14-automated-solution/recover_from_logs.py api_requests.log -s "test"

# Output:
# ✅ Found 1 system save attempt(s)
# 📋 Entry 1:
#    Timestamp: 2026-01-25T10:30:00
#    Data Preview:
#    - system_name: test
#    - system_name_en: Test System
#    ... etc
#
# 📝 Restore script generated: restore_data.py
```

#### Step 3: Restore data to database

```bash
# Review the restore script
cat restore_data.py

# Execute on production
scp restore_data.py admin_@34.142.152.104:/home/admin_/thong_ke_he_thong/
ssh admin_@34.142.152.104
cd /home/admin_/thong_ke_he_thong

# Run restore (INTERACTIVE - will ask for confirmation)
docker-compose exec backend python manage.py shell < restore_data.py
```

---

## 📊 Log Management

### Log Files Created:

| File | Purpose | Size Limit | Retention |
|------|---------|-----------|-----------|
| `logs/api_requests.log` | All API requests | 50 MB | 10 files (500 MB total) |
| `logs/errors.log` | Django errors | 10 MB | 5 files (50 MB total) |

### Automatic Rotation:

- **When:** Log file reaches size limit
- **Action:** Old file renamed to `.log.1`, `.log.2`, etc.
- **Cleanup:** Oldest files deleted after 10 backups

### Manual Log Rotation:

```bash
# Force log rotation
docker-compose exec backend python -c "
import logging.handlers
handler = logging.handlers.RotatingFileHandler(
    'logs/api_requests.log',
    maxBytes=50*1024*1024,
    backupCount=10
)
handler.doRollover()
"
```

### Searching Logs:

```bash
# Find all system creation requests
grep '"method": "POST"' logs/api_requests.log | grep '"/api/systems/"'

# Find requests by user
grep '"user": "admin"' logs/api_requests.log

# Find requests with errors
grep '❌ ERROR ❌' logs/api_requests.log

# Find specific system
grep -i "test system" logs/api_requests.log

# Get last 100 requests
tail -100 logs/api_requests.log | grep '🔥 SYSTEM_DATA 🔥'
```

---

## ⚙️ Configuration Options

### Reduce Log Verbosity (Production)

Edit middleware to skip certain fields:

```python
# In request_logging.py, add to RequestLoggingMiddleware:

SKIP_FIELDS = ['created_at', 'updated_at', 'deleted_at']

if request.method in ['POST', 'PUT', 'PATCH']:
    body = json.loads(request.body.decode('utf-8'))

    # Filter out skip fields
    filtered_body = {
        k: v for k, v in body.items()
        if k not in self.SKIP_FIELDS
    }

    log_data['body'] = filtered_body
```

### Enable Database Query Logging (Debug)

Uncomment in `settings.py`:

```python
'django.db.backends': {
    'handlers': ['console'],
    'level': 'DEBUG',
    'propagate': False,
},
```

**Warning:** Very verbose! Only use for debugging.

### Add Sensitive Data Filtering

Use the `SensitiveDataFilteringMiddleware`:

```python
MIDDLEWARE = [
    # ... other middleware ...
    'apps.systems.middleware.request_logging.RequestLoggingMiddleware',
    'apps.systems.middleware.request_logging.SensitiveDataFilteringMiddleware',
]
```

This will redact passwords, tokens, etc. from logs.

---

## 🎯 Verification Checklist

After installation, verify:

- [ ] Middleware imported without errors
- [ ] `logs/` directory created
- [ ] Backend starts without errors
- [ ] Creating system generates log entry
- [ ] Log file contains full request payload
- [ ] Log rotation works (check after 50MB)
- [ ] Can search logs by system name
- [ ] Recovery script works on test data
- [ ] Production deployment successful
- [ ] Logs accessible via SSH

---

## 🚨 Troubleshooting

### Issue: "No module named 'apps.systems.middleware'"

**Cause:** Missing `__init__.py` file

**Fix:**
```bash
touch backend/apps/systems/middleware/__init__.py
```

### Issue: "Permission denied: logs/api_requests.log"

**Cause:** Log directory not writable

**Fix:**
```bash
chmod 755 backend/logs
docker-compose restart backend
```

### Issue: "Logs not appearing"

**Cause:** Middleware not loaded or logging not configured

**Fix:**
```bash
# Check middleware is in settings
docker-compose exec backend python manage.py shell
>>> from django.conf import settings
>>> 'apps.systems.middleware.request_logging.RequestLoggingMiddleware' in settings.MIDDLEWARE
True

# Check logging config
>>> settings.LOGGING
{...}
```

### Issue: "Log file grows too large"

**Cause:** High traffic or verbose logging

**Fix:**
```python
# Reduce maxBytes in settings.py
'maxBytes': 10 * 1024 * 1024,  # 10 MB instead of 50 MB

# Or increase backupCount
'backupCount': 20,  # Keep more history
```

---

## 📚 Related Files

- **Middleware:** `14-automated-solution/request_logging_middleware.py`
- **Recovery Script:** `14-automated-solution/recover_from_logs.py`
- **Investigation Report:** `03-research/log-investigation-report.md`

---

## ✅ Success Criteria

Logging is working correctly when:

1. ✅ Each API request generates a log entry
2. ✅ Request body is logged for POST/PUT/PATCH
3. ✅ Log includes timestamp, user, IP, method, path
4. ✅ Can search logs by system name
5. ✅ Recovery script can extract data
6. ✅ Log rotation works automatically
7. ✅ No performance impact on API responses
8. ✅ Logs accessible for debugging

---

## 📊 Performance Impact

**Expected overhead:**
- **Request latency:** +5-10ms (negligible)
- **Disk I/O:** ~1KB per request
- **Memory:** Minimal (logging is async)
- **CPU:** <1% increase

**Recommended for:**
- ✅ All production environments
- ✅ Staging/testing environments
- ⚠️ Development (optional, useful for debugging)

---

## 🔒 Security Considerations

**Logged Data Includes:**
- ✅ Request payloads (may contain sensitive data)
- ✅ User information
- ✅ IP addresses

**Recommendations:**
1. Use `SensitiveDataFilteringMiddleware` for passwords
2. Restrict log file access: `chmod 640 logs/*.log`
3. Regular log rotation and archival
4. Consider encryption for log files at rest
5. Add log retention policy (delete after 90 days)

---

**Status:** Ready to implement
**Effort:** 30 minutes
**Priority:** HIGH
**Impact:** Prevents data loss incidents
