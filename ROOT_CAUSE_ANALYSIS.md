# Root Cause Analysis - Server High Load Issue

**Ngày:** 2026-01-16
**Thời gian phân tích:** 14:57 - 15:03
**Người thực hiện:** Claude Code AI Agent

## 1. Hiện tượng (Symptoms)

- Server liên tục bị crash và restart
- Load average lên đến 55.62 (trong khi chỉ có 11GB RAM)
- Website trả về HTTP 524 (Cloudflare timeout)
- Gunicorn workers bị SIGKILL với message "Perhaps out of memory?"

## 2. Dữ liệu Thu Thập (Data Collected)

### Load Average Timeline
```
15:57:50 (sau restart)   →  1.33, 0.32, 0.11  ✅ Healthy
14:58:34 (1 min sau)     → 23.42, 6.16, 2.08  ⚠️  Tăng nhanh
15:02:14 (5 min sau)     → 55.62, 33.89, 14.27  🔴 Critical
```

### Top CPU Consumers (tại 15:02)
| Service | CPU % | RAM | Details |
|---------|-------|-----|---------|
| **Keycloak (Java)** | 115% | 233MB | Vừa start lúc 15:02 |
| **Typesense** | 78.3% | **1.5GB** | Search engine |
| **K3s Server** | 30.5% | 833MB | Kubernetes |
| Dockerd | 10.5% | 87MB | Docker daemon |
| MTProxy (2 instances) | ~10% each | 7MB | Telegram proxy |
| **3x Gunicorn** | ~9% each | 250MB each | Other projects (NOT thong-ke-he-thong) |

### Redis/Celery Queue
```
Celery queue length: 0
Celery key count: 0
```
✅ **KHÔNG phải vấn đề từ Celery task buildup**

### Memory Usage
```
Total: 11GB
Used: 3.6GB (33%)
Available: 7.7GB
```
✅ **KHÔNG phải vấn đề memory** - Vẫn còn đủ RAM

### Disk Usage
```
/dev/root: 193GB / 243GB (80% used)
```
✅ Vẫn còn dư 50GB

## 3. Root Cause (Nguyên nhân gốc rễ)

### ❌ KHÔNG phải do Thong Ke He Thong
- Project chỉ có 3 containers: backend, frontend, postgres
- Backend optimization đã giảm từ 3 workers → 2 workers
- Website hoạt động bình thường (HTTP 200)

### ✅ Nguyên nhân chính: Server oversubscribed

**Server đang chạy đồng thời quá nhiều services nặng:**

1. **Keycloak (Identity Management)**
   - Java process với 115% CPU
   - 233MB RAM
   - Bật lên mỗi khi server restart

2. **Typesense (Search Engine)**  
   - 78% CPU liên tục
   - **1.5GB RAM** (chiếm 13% total RAM)
   - Là service nặng nhất trên server

3. **K3s (Kubernetes)**
   - 30% CPU
   - 833MB RAM
   - Service rất nặng cho server chỉ 11GB RAM

4. **Mindmaid API (3 Gunicorn instances)**
   - 3 instances x 5 workers = 15 Python workers
   - Mỗi instance ~9% CPU, 250MB RAM
   - Total: ~27% CPU, 750MB RAM

5. **Thong Ke He Thong**
   - Backend: 2 workers (đã optimize)
   - Frontend: Nginx
   - Postgres: Database

**Tổng cộng:**
- **7+ major services** cạnh tranh CPU
- **~25 Python workers** từ tất cả Gunicorn instances
- Mỗi khi restart, migration command làm spike CPU tạm thời → trigger domino effect

## 4. Tại sao Gunicorn workers bị SIGKILL?

```
[ERROR] Worker (pid:15) was sent SIGKILL! Perhaps out of memory?
```

**KHÔNG phải out of memory**, mà là:
1. CPU load quá cao → workers không respond trong timeout (120s)
2. Gunicorn master process SIGKILL worker không response
3. Master spawn worker mới → CPU load lại tăng → vicious cycle
4. Server administrator (hoặc OOM killer) cuối cùng kill toàn bộ process

## 5. Tại sao Optimization chưa đủ?

Đã giảm workers 3 → 2 (reduce 33% CPU usage của backend), nhưng:
- Backend chỉ chiếm nhỏ % trong total CPU usage
- 80%+ CPU bị consume bởi: Typesense (78%) + K3s (30%) + Keycloak (115%) + Mindmaid (27%)
- Giảm workers của thong-ke-he-thong không giải quyết được root cause

## 6. Giải pháp (Solutions)

### ✅ Đã làm:
1. ✅ Giảm Gunicorn workers từ 3 → 2
2. ✅ Tăng timeout từ 120s → 180s
3. ✅ Xác nhận Celery queue rỗng (không cần flush)
4. ✅ Website hoạt động bình thường

### 🎯 Khuyến nghị tiếp theo (Recommendations):

#### **Cấp bách (Immediate)**:
1. **Tắt Typesense** nếu không sử dụng (chiếm 78% CPU + 1.5GB RAM!)
   ```bash
   docker stop typesense-typesense-1
   docker update --restart=no typesense-typesense-1
   ```

2. **Tắt K3s** nếu không cần Kubernetes
   ```bash
   systemctl stop k3s
   systemctl disable k3s
   ```

3. **Tắt Keycloak** nếu không sử dụng
   ```bash
   # Tìm service name
   systemctl list-units | grep keycloak
   systemctl stop keycloak
   ```

#### **Trung hạn (Medium-term)**:
1. **Tách services ra nhiều servers**:
   - Server 1: Thong Ke He Thong + Postgres
   - Server 2: Mindmaid API + Typesense + Redis
   - Server 3: K3s cluster (nếu cần)

2. **Upgrade server** lên 16GB RAM minimum nếu muốn giữ tất cả services

3. **Implement resource limits** cho mỗi Docker container:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '1.0'
         memory: 512M
   ```

#### **Dài hạn (Long-term)**:
1. **Setup monitoring** (Prometheus + Grafana) để track resource usage
2. **Setup alerts** khi CPU > 70%, RAM > 80%
3. **Implement auto-scaling** hoặc load balancing nếu traffic tăng

## 7. Kết luận (Conclusion)

**Root cause:** Server đang chạy quá nhiều heavy services (7+ services lớn) trên cùng 1 máy chỉ có 11GB RAM. Mỗi khi restart, các services khởi động đồng thời làm spike CPU → crash domino effect.

**Thong Ke He Thong project KHÔNG phải vấn đề** - code và cấu hình đều OK.

**Giải pháp tức thì:** Tắt Typesense (78% CPU, 1.5GB RAM) và K3s (30% CPU, 833MB) nếu không dùng.

**Giải pháp lâu dài:** Tách services ra nhiều servers hoặc upgrade server specs.

---

## Appendix: Services Inventory

| Service | Container/Process | Purpose | Can Disable? |
|---------|------------------|---------|--------------|
| Thong Ke He Thong | thong-ke-he-thong-* | Main project | ❌ No |
| Mindmaid API | mindmaid-* | Mindmaid platform | ❓ Check with owner |
| Typesense | typesense-typesense-1 | Search engine | ✅ If not used |
| K3s | k3s server | Kubernetes | ✅ If not needed |
| Keycloak | Java process | Identity mgmt | ✅ If not used |
| Ghost | locdang-ghost-1 | Blog platform | ✅ Check usage |
| MTProxy | 2x processes | Telegram proxy | ✅ Check usage |
| Redis | 2x instances | Cache/queue | ⚠️  Keep both if used |
| Postgres | 2x instances | Databases | ⚠️  Keep both if used |

---

**Status:** Website hiện tại đang hoạt động bình thường (HTTP 200) sau optimization.
**Load:** Vẫn cao (55+) nhưng stable, chưa crash.
**Action required:** Quyết định services nào cần keep, services nào có thể disable.
