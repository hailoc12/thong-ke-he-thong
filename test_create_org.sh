#!/bin/bash
API_BASE="https://thongkehethong.mindmaid.ai/api"

echo "=== Test: Create Organization ==="

# 1. Get JWT token
echo "1. Getting JWT token..."
TOKEN_RESPONSE=$(curl -s -X POST "${API_BASE}/token/" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@2026"}')

ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('access', ''))" 2>/dev/null)

if [ -z "$ACCESS_TOKEN" ]; then
    echo "❌ Failed to get token"
    exit 1
fi

echo "✅ Got token"

# 2. Create Organization
echo ""
echo "2. Creating new organization..."
CREATE_RESPONSE=$(curl -s -X POST "${API_BASE}/organizations/" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sở Khoa học và Công nghệ Hà Nội",
    "code": "SKHCN-HN",
    "description": "Đơn vị quản lý khoa học công nghệ thành phố Hà Nội",
    "contact_person": "Nguyễn Văn A",
    "contact_email": "nguyenvana@hanoi.gov.vn",
    "contact_phone": "0243.8220000"
  }')

echo "$CREATE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$CREATE_RESPONSE"

# 3. List organizations to verify
echo ""
echo "3. Listing all organizations to verify..."
LIST_RESPONSE=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" "${API_BASE}/organizations/")
echo "$LIST_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$LIST_RESPONSE"

echo ""
echo "=== Test Complete ==="
