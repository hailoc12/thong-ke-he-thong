# Quick Reference - Thống Kê Hệ Thống

## ⚠️ CRITICAL: Ports

```
UAT        → Port 8002 → /home/admin_/apps/thong-ke-he-thong-uat
Production → Port 8000 → /home/admin_/apps/thong-ke-he-thong
```

**ALWAYS verify port before testing!**

```bash
# Check which port you're testing
netstat -tlnp | grep ":800"
```

---

## 🚀 Deploy to UAT

```bash
# 1. Copy file
scp views.py admin_@34.142.152.104:/home/admin_/apps/thong-ke-he-thong-uat/backend/apps/systems/views.py

# 2. Stop & Start (NOT restart!)
ssh admin_@34.142.152.104 'cd /home/admin_/apps/thong-ke-he-thong-uat && docker compose stop backend && sleep 3 && docker compose start backend'

# 3. Test on port 8002
```

---

## 🚀 Deploy to Production

```bash
# 1. Copy file
scp views.py admin_@34.142.152.104:/home/admin_/apps/thong-ke-he-thong/backend/apps/systems/views.py

# 2. Stop & Start (NOT restart!)
ssh admin_@34.142.152.104 'cd /home/admin_/apps/thong-ke-he-thong && docker compose stop backend && sleep 3 && docker compose start backend'

# 3. Test on port 8000
```

---

## 🧪 Quick Test

```bash
# UAT (port 8002)
ssh admin_@34.142.152.104 'bash -s' << 'EOF'
TOKEN=$(curl -s -X POST "http://localhost:8002/api/token/" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@2026"}' | jq -r '.access')

curl -s "http://localhost:8002/api/systems/ai_query_stream/?query=Test&token=$TOKEN&mode=quick" | grep "d3js.org" && echo "✅ D3.js working" || echo "❌ D3.js not found"
EOF
```

---

## 🐛 If Changes Don't Show

```bash
# Clear cache & force restart
ssh admin_@34.142.152.104 'cd /home/admin_/apps/thong-ke-he-thong-uat && \
  docker compose exec -T backend find /app -type f -name "*.pyc" -delete && \
  docker compose stop backend && sleep 3 && docker compose start backend'
```

---

## 📁 Key Files

```
Backend: backend/apps/systems/views.py
Frontend: frontend/src/pages/StrategicDashboard.tsx
Docs: D3JS_VISUALIZATION_IMPLEMENTATION.md
```

---

## 🎯 Remember

- ✅ UAT = 8002
- ✅ Production = 8000
- ✅ Stop & Start (NOT restart)
- ✅ Test on correct port!
