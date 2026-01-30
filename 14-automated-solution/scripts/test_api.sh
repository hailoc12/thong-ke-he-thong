#!/bin/bash
# Test API features

API_BASE="https://thongkehethong.mindmaid.ai/api"
ADMIN_USER="admin"
ADMIN_PASS="Admin@2026"

echo "=== Testing API Endpoints ==="
echo ""

# 1. Get CSRF token and login
echo "1. Login to get auth token..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE}/auth/login/" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"${ADMIN_USER}\",\"password\":\"${ADMIN_PASS}\"}")

echo "Login response: $LOGIN_RESPONSE"
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Login failed or token not found"
    echo "Trying with session auth..."
    
    # Try session-based auth
    COOKIE_FILE="/tmp/django_session_cookie.txt"
    curl -s -c "$COOKIE_FILE" -X POST "${API_BASE}/auth/login/" \
      -H "Content-Type: application/json" \
      -d "{\"username\":\"${ADMIN_USER}\",\"password\":\"${ADMIN_PASS}\"}" > /dev/null
    
    # Test with session
    echo ""
    echo "2. Testing Organizations endpoint with session..."
    ORG_RESPONSE=$(curl -s -b "$COOKIE_FILE" "${API_BASE}/organizations/")
    echo "$ORG_RESPONSE" | head -c 500
else
    echo "✅ Got token: ${TOKEN:0:20}..."
    
    echo ""
    echo "2. Testing Organizations endpoint..."
    ORG_RESPONSE=$(curl -s -H "Authorization: Token $TOKEN" "${API_BASE}/organizations/")
    echo "$ORG_RESPONSE" | head -c 500
fi

echo ""
echo ""
echo "3. Testing Systems endpoint..."
SYSTEMS_RESPONSE=$(curl -s "${API_BASE}/systems/" | head -c 500)
echo "$SYSTEMS_RESPONSE"

echo ""
echo ""
echo "=== Test Complete ==="
