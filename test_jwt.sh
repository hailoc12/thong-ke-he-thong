#!/bin/bash
API_BASE="https://thongkehethong.mindmaid.ai/api"

echo "=== Testing JWT Authentication ==="
echo "1. Get JWT token..."

TOKEN_RESPONSE=$(curl -s -X POST "${API_BASE}/token/" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@2026"}')

echo "Response: $TOKEN_RESPONSE"

ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('access', ''))" 2>/dev/null)

if [ -n "$ACCESS_TOKEN" ]; then
    echo "✅ Got access token"
    echo ""
    echo "2. Test Organizations API..."
    ORG_RESPONSE=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" "${API_BASE}/organizations/")
    echo "$ORG_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$ORG_RESPONSE"
    
    echo ""
    echo "3. Test Systems API..."
    SYS_RESPONSE=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" "${API_BASE}/systems/")
    echo "$SYS_RESPONSE" | python3 -m json.tool 2>/dev/null | head -50 || echo "$SYS_RESPONSE"
else
    echo "❌ Failed to get token"
fi
