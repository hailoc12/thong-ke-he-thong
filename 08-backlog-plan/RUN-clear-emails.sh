#!/bin/bash
# Run script to clear all user emails

cd "/Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong"

echo "=================================="
echo "CLEARING ALL USER EMAILS"
echo "=================================="

# Execute SQL
cat 08-backlog-plan/clear-all-emails.sql | docker compose exec -T postgres psql -U postgres -d thongke

echo ""
echo "✅ Done! All user emails have been cleared."
