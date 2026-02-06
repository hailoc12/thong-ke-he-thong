# Backend API Testing Guide - Policy Management

## ✅ DEPLOYMENT STATUS

### UAT Server
- URL: https://thong-ke-he-thong-uat.mindmaid.ai
- Status: ✅ DEPLOYED
- Migration: 0028_add_custom_policy ✅ Applied
- Backend: ✅ Restarted

### Production Server
- URL: https://hientrangcds.mst.gov.vn
- Status: ✅ DEPLOYED
- Migrations: 0027, 0028, 0029_merge ✅ Applied
- Backend: ✅ Restarted

---

## 🔧 API ENDPOINTS TO TEST

### Base URL
- UAT: `https://thong-ke-he-thong-uat.mindmaid.ai/api`
- Production: `https://hientrangcds.mst.gov.vn/api`

### Authentication
All endpoints require JWT token in header:
```
Authorization: Bearer <your_token>
```

Get token from login first.

---

## 📋 TEST SCENARIOS

### 1. Get Active Policies (All Users)

**Endpoint**: `GET /api/ai-feedback/active_policies/`

**Expected Response**:
```json
{
  "active_policies": [
    {
      "category": "accuracy",
      "rule": "CRITICAL: Always verify SQL query results...",
      "priority": "high",
      "evidence_count": 5,
      "is_custom": false
    }
  ],
  "total_policies": 4,
  "active_count": 2,
  "auto_generated_count": 3,
  "custom_count": 1
}
```

**Test with curl**:
```bash
# Replace TOKEN with actual JWT token
curl -X GET \
  "https://thong-ke-he-thong-uat.mindmaid.ai/api/ai-feedback/active_policies/" \
  -H "Authorization: Bearer TOKEN"
```

**Expected**:
- Status: 200 OK
- Returns merged list of auto-generated + custom policies
- Shows counts breakdown

---

### 2. Get Policy Status (Admin Only)

**Endpoint**: `GET /api/ai-feedback/policy_status/`

**Permission**: lanhdaobo or admin

**Expected Response**:
```json
{
  "total_policies": 4,
  "auto_generated": 3,
  "custom": 1,
  "active_policies": 2,
  "injection_points": [
    "Quick Mode Prompt (Line 4074)",
    "Deep Mode Phase 1 Prompt (Line 4637)",
    "Deep Mode Enhancement Prompt (Line 4935)"
  ],
  "last_regeneration": "2026-02-06T10:30:00Z",
  "policies_breakdown": {
    "high": 1,
    "medium": 2,
    "low": 1
  },
  "status": "active",
  "message": "Policies are currently being injected into AI prompts"
}
```

**Test with curl**:
```bash
curl -X GET \
  "https://thong-ke-he-thong-uat.mindmaid.ai/api/ai-feedback/policy_status/" \
  -H "Authorization: Bearer TOKEN"
```

**Expected**:
- Status: 200 OK
- Shows injection points (where policies are used)
- Breakdown by priority
- Last regeneration timestamp

---

### 3. Regenerate Policies (Admin Only)

**Endpoint**: `POST /api/ai-feedback/regenerate_policies/`

**Permission**: lanhdaobo or admin

**Expected Response**:
```json
{
  "policies": [
    {
      "category": "accuracy",
      "rule": "CRITICAL: Always verify SQL...",
      "priority": "high",
      "evidence_count": 5
    }
  ],
  "count": 3,
  "timestamp": "2026-02-06T10:35:00.123456Z",
  "message": "Successfully regenerated 3 policies from negative feedback"
}
```

**Test with curl**:
```bash
curl -X POST \
  "https://thong-ke-he-thong-uat.mindmaid.ai/api/ai-feedback/regenerate_policies/" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json"
```

**Expected**:
- Status: 200 OK
- Returns newly generated policies
- Marks negative feedback as analyzed

---

### 4. List Custom Policies (Admin Only)

**Endpoint**: `GET /api/custom-policies/`

**Permission**: lanhdaobo or admin

**Expected Response**:
```json
[
  {
    "id": 1,
    "category": "accuracy",
    "rule": "Always cross-check data with database schema",
    "priority": "high",
    "rationale": "Users reported incorrect counts multiple times",
    "created_by": 1,
    "created_by_username": "admin",
    "created_at": "2026-02-06T10:00:00Z",
    "updated_at": "2026-02-06T10:00:00Z",
    "is_active": true
  }
]
```

**Test with curl**:
```bash
curl -X GET \
  "https://thong-ke-he-thong-uat.mindmaid.ai/api/custom-policies/" \
  -H "Authorization: Bearer TOKEN"
```

**Expected**:
- Status: 200 OK (or 404 if no custom policies yet)
- Returns list of custom policies

---

### 5. Create Custom Policy (Admin Only)

**Endpoint**: `POST /api/custom-policies/`

**Permission**: lanhdaobo or admin

**Request Body**:
```json
{
  "category": "clarity",
  "rule": "Always use Vietnamese for system names and avoid English technical terms",
  "priority": "medium",
  "rationale": "Users find English terms confusing in Vietnamese context"
}
```

**Test with curl**:
```bash
curl -X POST \
  "https://thong-ke-he-thong-uat.mindmaid.ai/api/custom-policies/" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "clarity",
    "rule": "Always use Vietnamese for system names",
    "priority": "medium",
    "rationale": "Users prefer Vietnamese terminology"
  }'
```

**Expected**:
- Status: 201 Created
- Returns created policy with id
- created_by set automatically to current user

---

### 6. Update Custom Policy (Admin Only)

**Endpoint**: `PATCH /api/custom-policies/{id}/`

**Permission**: lanhdaobo or admin

**Request Body** (partial update):
```json
{
  "priority": "high",
  "rule": "MUST use Vietnamese for all system names"
}
```

**Test with curl**:
```bash
# Replace {id} with actual policy ID
curl -X PATCH \
  "https://thong-ke-he-thong-uat.mindmaid.ai/api/custom-policies/1/" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "priority": "high"
  }'
```

**Expected**:
- Status: 200 OK
- Returns updated policy
- updated_at timestamp changes

---

### 7. Delete Custom Policy (Admin Only)

**Endpoint**: `DELETE /api/custom-policies/{id}/`

**Permission**: lanhdaobo or admin

**Test with curl**:
```bash
# Replace {id} with actual policy ID
curl -X DELETE \
  "https://thong-ke-he-thong-uat.mindmaid.ai/api/custom-policies/1/" \
  -H "Authorization: Bearer TOKEN"
```

**Expected**:
- Status: 204 No Content
- Policy deleted from database

---

### 8. Get All Feedbacks (Admin Only)

**Endpoint**: `GET /api/ai-feedback/`

**Permission**: lanhdaobo or admin

**Query Parameters**:
- `rating`: 'positive' or 'negative'
- `mode`: 'quick' or 'deep'
- `page`: page number
- `page_size`: items per page

**Test with curl**:
```bash
# Get all feedbacks
curl -X GET \
  "https://thong-ke-he-thong-uat.mindmaid.ai/api/ai-feedback/" \
  -H "Authorization: Bearer TOKEN"

# Filter negative feedbacks only
curl -X GET \
  "https://thong-ke-he-thong-uat.mindmaid.ai/api/ai-feedback/?rating=negative" \
  -H "Authorization: Bearer TOKEN"

# Pagination
curl -X GET \
  "https://thong-ke-he-thong-uat.mindmaid.ai/api/ai-feedback/?page=1&page_size=20" \
  -H "Authorization: Bearer TOKEN"
```

**Expected**:
- Status: 200 OK
- Returns paginated list of feedbacks
- Filters work correctly

---

## 🔍 VERIFICATION CHECKLIST

### Database
- [ ] CustomPolicy table created
- [ ] AIResponseFeedback table exists (from migration 0027)
- [ ] Indexes created correctly

**Check on server**:
```bash
ssh admin_@34.142.152.104
cd /home/admin_/apps/thong-ke-he-thong-uat
docker compose exec postgres psql -U postgres -d thong_ke_he_thong

# Check tables
\dt systems_custom_policy
\dt systems_ai_response_feedback

# Check data
SELECT * FROM systems_custom_policy;
SELECT COUNT(*) FROM systems_ai_response_feedback;
```

### API Routes
- [ ] /api/ai-feedback/active_policies/ - Works
- [ ] /api/ai-feedback/policy_status/ - Works (admin)
- [ ] /api/ai-feedback/regenerate_policies/ - Works (admin)
- [ ] /api/custom-policies/ - CRUD works (admin)

### Permissions
- [ ] Regular users can call active_policies
- [ ] Only admin/lanhdaobo can call policy_status
- [ ] Only admin/lanhdaobo can regenerate
- [ ] Only admin/lanhdaobo can manage custom policies

### Integration
- [ ] Custom policies merge with auto-generated
- [ ] active_count includes both types
- [ ] Regenerate marks feedbacks as analyzed

---

## 🐛 TROUBLESHOOTING

### Error: 401 Unauthorized
**Solution**: Token expired or invalid. Login again to get new token.

### Error: 403 Forbidden
**Solution**: User doesn't have admin/lanhdaobo role. Check permissions.

### Error: 404 Not Found on /api/custom-policies/
**Solution**:
- If no policies exist yet, this is normal
- Create first policy with POST request

### Error: 500 Internal Server Error
**Solutions**:
1. Check backend logs:
   ```bash
   docker compose logs backend --tail=100
   ```
2. Verify migrations ran:
   ```bash
   docker compose exec backend python manage.py showmigrations systems
   ```
3. Restart backend:
   ```bash
   docker compose restart backend
   ```

---

## 📊 NEXT STEPS

After backend testing is complete:

1. **Phase 2: Frontend UI** (Tasks #4, #5)
   - Create AIFeedbackPolicies page
   - Create policy management modals
   - Add route and menu item
   - Connect to backend APIs

2. **Integration Testing**
   - Test full workflow: Create policy → Verify in prompt → Test AI response
   - Test edit/delete policy → Verify changes applied
   - Test regenerate → Check new policies appear

3. **UAT Testing**
   - lanhdaobo user tests full features
   - Verify UI is intuitive
   - Check all buttons work

4. **Production Deployment**
   - Deploy frontend
   - Final testing on production
   - User training/documentation

---

## 📞 SUPPORT

If any issues during testing, check:
1. Backend logs: `docker compose logs backend`
2. Migration status: `docker compose exec backend python manage.py showmigrations`
3. Database: Direct SQL queries via psql

**Testing Complete? Report back with results!** 🚀
