#!/usr/bin/env bash
# Test P0.5 Multi-Tenancy Deployment
# Created: 2026-01-17

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}✓${NC} $1"; }
log_warn() { echo -e "${YELLOW}!${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1" >&2; }

BASE_URL="https://thongkehethong.mindmaid.ai/api"

echo "========================================="
echo "Testing P0.5 Multi-Tenancy Deployment"
echo "========================================="
echo ""

# Test 1: Login and get token
echo "Test 1: Admin Login"
echo "---"
RESPONSE=$(curl -s -X POST "${BASE_URL}/token/" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@2026"}')

if echo "$RESPONSE" | grep -q '"access"'; then
  log_info "Login successful"
  ACCESS_TOKEN=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['access'])")
  USER_ROLE=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['user']['role'])")

  if [ "$USER_ROLE" = "admin" ]; then
    log_info "User role is: $USER_ROLE"
  else
    log_error "Expected role 'admin' but got: $USER_ROLE"
    exit 1
  fi
else
  log_error "Login failed"
  echo "$RESPONSE"
  exit 1
fi
echo ""

# Test 2: Access Users endpoint
echo "Test 2: Access Users API"
echo "---"
USERS_RESPONSE=$(curl -s "${BASE_URL}/users/" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

if echo "$USERS_RESPONSE" | grep -q '"username"'; then
  USER_COUNT=$(echo "$USERS_RESPONSE" | python3 -c "import sys, json; print(len(json.load(sys.stdin)))")
  log_info "Users API accessible. Found $USER_COUNT users"
else
  log_error "Users API failed"
  echo "$USERS_RESPONSE"
  exit 1
fi
echo ""

# Test 3: Get Organizations
echo "Test 3: Organizations API"
echo "---"
ORGS_RESPONSE=$(curl -s "${BASE_URL}/organizations/" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

if echo "$ORGS_RESPONSE" | grep -q '"name"' || echo "$ORGS_RESPONSE" | grep -q '\[\]'; then
  if echo "$ORGS_RESPONSE" | grep -q '\[\]'; then
    log_warn "No organizations found (empty array)"
    ORG_ID=""
  else
    ORG_COUNT=$(echo "$ORGS_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data) if isinstance(data, list) else len(data.get('results', [])))")
    log_info "Organizations API accessible. Found $ORG_COUNT organizations"

    # Get first org ID for user creation test
    ORG_ID=$(echo "$ORGS_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); orgs=data if isinstance(data, list) else data.get('results', []); print(orgs[0]['id'] if len(orgs) > 0 else '')")
  fi
else
  log_error "Organizations API failed"
  echo "$ORGS_RESPONSE"
  exit 1
fi
echo ""

# Test 4: Get Systems (should work for admin)
echo "Test 4: Systems API"
echo "---"
SYSTEMS_RESPONSE=$(curl -s "${BASE_URL}/systems/" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

if echo "$SYSTEMS_RESPONSE" | grep -q '"system_name"' || echo "$SYSTEMS_RESPONSE" | grep -q '\[\]'; then
  if echo "$SYSTEMS_RESPONSE" | grep -q '\[\]'; then
    log_warn "No systems found (empty array)"
  else
    SYSTEM_COUNT=$(echo "$SYSTEMS_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data) if isinstance(data, list) else data.get('count', 0))")
    log_info "Systems API accessible. Found $SYSTEM_COUNT systems"
  fi
else
  log_error "Systems API failed"
  echo "$SYSTEMS_RESPONSE"
  exit 1
fi
echo ""

# Test 5: Create org user (if org exists)
if [ -n "$ORG_ID" ]; then
  echo "Test 5: Create Organization User"
  echo "---"

  TIMESTAMP=$(date +%s)
  TEST_USER="testorg${TIMESTAMP}"

  CREATE_RESPONSE=$(curl -s -X POST "${BASE_URL}/users/" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{
      \"username\": \"${TEST_USER}\",
      \"email\": \"${TEST_USER}@test.com\",
      \"password\": \"Test1234!\",
      \"role\": \"org_user\",
      \"organization\": ${ORG_ID}
    }")

  if echo "$CREATE_RESPONSE" | grep -q '"username"'; then
    log_info "Created test org user: $TEST_USER"

    # Test 6: Login as org user
    echo ""
    echo "Test 6: Org User Login"
    echo "---"

    ORG_LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/token/" \
      -H "Content-Type: application/json" \
      -d "{\"username\":\"${TEST_USER}\",\"password\":\"Test1234!\"}")

    if echo "$ORG_LOGIN_RESPONSE" | grep -q '"access"'; then
      log_info "Org user login successful"

      ORG_USER_TOKEN=$(echo "$ORG_LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['access'])")
      ORG_USER_ROLE=$(echo "$ORG_LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['user']['role'])")

      if [ "$ORG_USER_ROLE" = "org_user" ]; then
        log_info "User role is: $ORG_USER_ROLE"
      else
        log_error "Expected role 'org_user' but got: $ORG_USER_ROLE"
      fi

      # Test 7: Org user cannot access Users API
      echo ""
      echo "Test 7: Org User Permissions"
      echo "---"

      ORG_USERS_RESPONSE=$(curl -s "${BASE_URL}/users/" \
        -H "Authorization: Bearer ${ORG_USER_TOKEN}")

      if echo "$ORG_USERS_RESPONSE" | grep -q "do not have permission"; then
        log_info "Org user correctly denied access to Users API"
      else
        log_warn "Org user may have unexpected access to Users API"
      fi

    else
      log_error "Org user login failed"
      echo "$ORG_LOGIN_RESPONSE"
    fi
  else
    log_error "Failed to create org user"
    echo "$CREATE_RESPONSE"
  fi
else
  log_warn "Skipping org user creation test (no organizations available)"
fi

echo ""
echo "========================================="
echo "All Tests Completed!"
echo "========================================="
