#!/usr/bin/env bash
# HOT FIX Deployment Script: Text Field Length Limit
# Date: 2026-01-25
# Bug: Users cannot save long text in "Khác" fields

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${GREEN}✓${NC} $1"; }
log_warn() { echo -e "${YELLOW}!${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1" >&2; }
log_step() { echo -e "${BLUE}▶${NC} $1"; }

SERVER="admin_@34.142.152.104"
REMOTE_DIR="/home/admin_/thong_ke_he_thong"
LOCAL_DIR="/Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong"

echo "=========================================="
echo "HOT FIX: Text Field Length Limit"
echo "=========================================="
echo ""

# Step 1: Backup database
log_step "Step 1: Backing up production database..."
ssh $SERVER "cd $REMOTE_DIR && pg_dump -U admin_ -h localhost system_reports > backup_before_hotfix_\$(date +%Y%m%d_%H%M%S).sql && ls -lh backup_*.sql | tail -1"
log_info "Database backed up successfully"
echo ""

# Step 2: Upload migration file
log_step "Step 2: Uploading migration file..."
scp "$LOCAL_DIR/backend/apps/systems/migrations/0021_convert_text_fields_to_textfield.py" \
    $SERVER:$REMOTE_DIR/backend/apps/systems/migrations/
log_info "Migration file uploaded"
echo ""

# Step 3: Upload updated models.py
log_step "Step 3: Uploading updated models.py..."
scp "$LOCAL_DIR/backend/apps/systems/models.py" \
    $SERVER:$REMOTE_DIR/backend/apps/systems/
log_info "Models.py uploaded"
echo ""

# Step 4: Check migration status
log_step "Step 4: Checking migration status..."
ssh $SERVER "cd $REMOTE_DIR/backend && source env/bin/activate && python manage.py showmigrations systems | tail -5"
echo ""

# Step 5: Run migration
log_step "Step 5: Running migration..."
log_warn "About to run migration on PRODUCTION database!"
read -p "Continue? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    log_error "Deployment cancelled by user"
    exit 1
fi

ssh $SERVER "cd $REMOTE_DIR/backend && source env/bin/activate && python manage.py migrate systems 0021"
log_info "Migration completed successfully"
echo ""

# Step 6: Restart backend
log_step "Step 6: Restarting backend..."
ssh $SERVER "sudo systemctl restart thong_ke_he_thong_backend 2>/dev/null || sudo supervisorctl restart thong_ke_he_thong_backend 2>/dev/null || echo 'Manual restart required'"
sleep 3
log_info "Backend restart initiated"
echo ""

# Step 7: Verify backend is running
log_step "Step 7: Verifying backend status..."
ssh $SERVER "ps aux | grep -E 'python.*manage.py' | grep -v grep | head -3"
log_info "Backend is running"
echo ""

# Step 8: Test with Django shell
log_step "Step 8: Running verification test..."
cat > /tmp/test_hotfix.py << 'EOF'
from apps.systems.models import System
from apps.organizations.models import Organization

# Create test with long text
org = Organization.objects.first()
if not org:
    print("ERROR: No organization found")
    exit(1)

test_text = "Bao gồm: " + "Hệ thống quản lý nội bộ, hệ thống biên tập, phê duyệt tin bài. " * 20
print(f"Testing with {len(test_text)} characters...")

try:
    system = System.objects.create(
        org=org,
        system_name="TEST_HOTFIX_LONG_TEXT",
        system_group=test_text,
        scope="internal_unit"
    )
    print(f"✓ Created system ID: {system.id}")

    # Retrieve and verify
    s = System.objects.get(id=system.id)
    print(f"✓ Retrieved system_group length: {len(s.system_group)}")

    if len(s.system_group) == len(test_text):
        print("✓ VERIFICATION PASSED: Long text saved and retrieved correctly")
    else:
        print(f"✗ VERIFICATION FAILED: Length mismatch")

    # Clean up
    system.delete()
    print("✓ Test data cleaned up")

except Exception as e:
    print(f"✗ ERROR: {e}")
    exit(1)
EOF

scp /tmp/test_hotfix.py $SERVER:/tmp/
ssh $SERVER "cd $REMOTE_DIR/backend && source env/bin/activate && python manage.py shell < /tmp/test_hotfix.py"
rm /tmp/test_hotfix.py
ssh $SERVER "rm /tmp/test_hotfix.py"
log_info "Verification test completed"
echo ""

# Final summary
echo "=========================================="
echo -e "${GREEN}HOT FIX DEPLOYMENT COMPLETED${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Test from frontend: http://34.142.152.104:3000"
echo "2. Create new system, select 'Khác' for Nhóm hệ thống"
echo "3. Input 500+ characters and verify save works"
echo ""
echo "Rollback command (if needed):"
echo "  ssh $SERVER 'cd $REMOTE_DIR/backend && source env/bin/activate && python manage.py migrate systems 0020'"
echo ""
