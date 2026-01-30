#!/bin/bash
API_BASE="https://thongkehethong.mindmaid.ai/api"

echo "=== Test: Create System (v2 with correct choices) ==="

# Get token
TOKEN_RESPONSE=$(curl -s -X POST "${API_BASE}/token/" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@2026"}')

ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('access', ''))" 2>/dev/null)

echo "✅ Got token"

# Create System with CORRECT choices
echo ""
echo "Creating system with correct choice values..."
CREATE_RESPONSE=$(curl -s -X POST "${API_BASE}/systems/" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "org": 1,
    "system_code": "HT001",
    "system_name": "Hệ thống quản lý văn bản điện tử",
    "system_name_en": "Document Management System",
    "purpose": "Quản lý văn bản đi, đến và lưu trữ hồ sơ điện tử",
    "scope": "org_wide",
    "system_group": "business",
    "status": "operating",
    "criticality_level": "high",
    "form_level": 1,
    "go_live_date": "2024-01-01",
    "business_owner": "Trưởng phòng Hành chính",
    "technical_owner": "Phòng CNTT",
    "responsible_person": "Nguyễn Văn B",
    "responsible_email": "nguyenvanb@hanoi.gov.vn",
    "responsible_phone": "0987654321",
    "users_total": 150,
    "architecture_data": {
      "architecture_type": "monolithic",
      "backend_tech": "Django Python",
      "frontend_tech": "React",
      "database_type": "PostgreSQL",
      "hosting_type": "on_premise"
    },
    "data_info_data": {
      "storage_size_gb": 500,
      "has_api": true,
      "has_personal_data": true,
      "has_sensitive_data": false,
      "data_classification": "internal"
    },
    "operations_data": {
      "dev_type": "internal",
      "developer": "Phòng CNTT",
      "warranty_status": "active",
      "has_maintenance_contract": true,
      "operator": "Phòng CNTT",
      "vendor_dependency": "low"
    },
    "integration_data": {
      "has_integration": true,
      "integration_count": 3,
      "connected_internal_systems": "Email, HR System",
      "uses_standard_api": true
    },
    "assessment_data": {
      "performance_rating": 4,
      "uptime_percent": 99.5,
      "user_satisfaction_rating": 4,
      "technical_debt_level": "low",
      "needs_replacement": false
    }
  }')

echo "$CREATE_RESPONSE" | python3 -m json.tool 2>/dev/null | head -100 || echo "$CREATE_RESPONSE"

echo ""
echo "Listing systems..."
LIST=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" "${API_BASE}/systems/")
echo "$LIST" | python3 -m json.tool 2>/dev/null | head -60

echo ""
echo "=== Test Complete ==="
