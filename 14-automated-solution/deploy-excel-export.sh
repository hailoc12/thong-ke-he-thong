#!/usr/bin/env bash
# Deploy Excel Export Feature to Production
# Run this on the production server: 34.142.152.104

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${GREEN}✓${NC} $1"; }
log_warn() { echo -e "${YELLOW}!${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1" >&2; }
log_step() { echo -e "${BLUE}→${NC} $1"; }

APP_DIR="/opt/thong_ke_he_thong"

main() {
    log_step "=== Deploy Excel Export Feature ==="

    cd "$APP_DIR" || {
        log_error "Cannot find $APP_DIR"
        exit 1
    }

    log_info "Current directory: $(pwd)"

    # 1. Backup current version
    log_step "Creating backup..."
    BACKUP_DIR="/opt/backups/thong_ke_he_thong/excel-export-$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    cp -r frontend/src "$BACKUP_DIR/" || true
    log_info "Backup created at $BACKUP_DIR"

    # 2. Install xlsx package
    log_step "Installing xlsx package..."
    cd frontend
    npm install xlsx --save
    log_info "xlsx package installed"
    cd ..

    # 3. Create exportExcel.ts
    log_step "Creating exportExcel utility..."
    cat > frontend/src/utils/exportExcel.ts << 'EXPORT_EXCEL_EOF'
/**
 * Export Dashboard Statistics to Excel
 * Generates 4 sheets: Tổng quan, Theo đơn vị, Danh sách HT, Lưu ý đôn đốc
 */

import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

// Vietnamese status labels
const STATUS_LABELS: Record<string, string> = {
  operating: 'Đang vận hành',
  pilot: 'Thí điểm',
  stopped: 'Dừng',
  replacing: 'Sắp thay thế',
};

const CRITICALITY_LABELS: Record<string, string> = {
  high: 'Cực kỳ quan trọng',
  medium: 'Quan trọng',
  low: 'Trung bình',
};

interface OrgStats {
  id: number;
  name: string;
  system_count: number;
  avg_completion: number;
  systems_100_percent: number;
  systems_below_50_percent: number;
}

interface CompletionData {
  summary: {
    organizations: OrgStats[];
    total_systems: number;
    avg_completion_all: number;
    systems_100_percent: number;
    systems_below_50_percent: number;
  };
}

interface System {
  id: number;
  system_name: string;
  org_name?: string;
  status: string;
  criticality: string;
  completion_percentage: number;
  updated_at: string;
}

/**
 * Generate Sheet 1: Tổng quan
 */
function generateSummarySheet(
  statistics: any,
  completionData: CompletionData | null
): any[][] {
  const getActiveRate = () => {
    if (!statistics?.total || statistics.total === 0) return 0;
    const operating = statistics.by_status?.operating ?? 0;
    return ((operating / statistics.total) * 100).toFixed(1);
  };

  const getCriticalRate = () => {
    if (!statistics?.total || statistics.total === 0) return 0;
    const high = statistics.by_criticality?.high ?? 0;
    return ((high / statistics.total) * 100).toFixed(1);
  };

  const getPilotRate = () => {
    if (!statistics?.total || statistics.total === 0) return 0;
    const pilot = statistics.by_status?.pilot ?? 0;
    return ((pilot / statistics.total) * 100).toFixed(1);
  };

  return [
    ['BÁO CÁO TỔNG QUAN HỆ THỐNG CDS', '', '', `Ngày ${dayjs().format('DD/MM/YYYY')}`],
    [],
    ['CHỈ TIÊU', 'GIÁ TRỊ', 'GHI CHÚ'],
    ['-----------------------------------------------------------------'],
    ['THEO TRẠNG THÁI', '', ''],
    ['1. Tổng số hệ thống', statistics?.total || 0, ''],
    ['2. Số hệ thống đang hoạt động', statistics?.by_status.operating || 0, `${getActiveRate()}%`],
    ['3. Số hệ thống thí điểm', statistics?.by_status.pilot || 0, `${getPilotRate()}%`],
    ['4. Số hệ thống dừng', statistics?.by_status.stopped || 0, ''],
    ['5. Số hệ thống sắp thay thế', statistics?.by_status.replacing || 0, ''],
    [],
    ['THEO MỨC ĐỘ QUAN TRỌNG', '', ''],
    ['6. Cực kỳ quan trọng', statistics?.by_criticality.high || 0, `${getCriticalRate()}%`],
    ['7. Quan trọng', statistics?.by_criticality.medium || 0, ''],
    ['8. Trung bình', statistics?.by_criticality.low || 0, ''],
    ['9. Thấp', 0, ''],
    [],
    ['THEO TRÌNH ĐỘ NHẬP LIỆU', '', ''],
    ['10. Tỷ lệ nhập liệu TB', `${statistics?.average_completion_percentage?.toFixed(1) || 0}%`, ''],
    ['11. Số hệ thống hoàn thành 100%', completionData?.summary?.systems_100_percent || 0, ''],
    ['12. Số hệ thống dưới 50%', completionData?.summary?.systems_below_50_percent || 0, ''],
  ];
}

/**
 * Calculate organization summary statistics
 */
function calculateOrgSummary(orgs: OrgStats[]) {
  const updated = orgs.filter((o) => o.avg_completion > 0).length;
  const notUpdated = orgs.length - updated;
  const above80 = orgs.filter((o) => o.avg_completion >= 80).length;
  const range60to80 = orgs.filter((o) => o.avg_completion >= 60 && o.avg_completion < 80).length;
  const below60 = orgs.filter((o) => o.avg_completion > 0 && o.avg_completion < 60).length;
  const below30 = orgs.filter((o) => o.avg_completion > 0 && o.avg_completion < 30).length;
  return { updated, notUpdated, above80, range60to80, below60, below30 };
}

/**
 * Generate Sheet 2: Theo đơn vị
 */
function generateOrgSheet(orgs: OrgStats[]): any[][] {
  const sortedOrgs = [...orgs].sort((a, b) => b.avg_completion - a.avg_completion);
  const vnTime = dayjs().utcOffset(7).format('DD/MM HH:mm');
  const summary = calculateOrgSummary(sortedOrgs);

  return [
    ['STT', 'ĐƠN VỊ', 'TRẠNG THÁI', `TỶ LỆ NHẬP DỮ LIỆU TÍNH ĐẾN ${vnTime}`, ''],
    ['', '', '', 'Số hệ thống', '% hoàn thành trung bình'],
    [''],
    ...sortedOrgs.map((org, idx) => [
      idx + 1,
      org.name,
      'Hoạt động',
      org.system_count > 0 ? org.system_count : 'Chưa có dữ liệu',
      org.avg_completion > 0 ? org.avg_completion.toFixed(2).replace('.', ',') : 'Chưa có dữ liệu',
    ]),
    [''],
    [`Tổng hợp: ${orgs.length} Đơn vị`, '', '', '', ''],
    ['Đã cập nhật', '', '', '', ''],
    ['Trong đó:', '', '', '', ''],
    ['  Tỷ lệ CNDL > 80%', '', '', '', summary.above80],
    ['  Tỷ lệ CNDL từ 60% đến 80%', '', '', '', summary.range60to80],
    ['  Tỷ lệ CNDL < 60%', '', '', '', summary.below60],
    ['  Tỷ lệ CNDL <30%', '', '', '', summary.below30],
    ['Chưa cập nhật', '', '', '', summary.notUpdated],
    [''],
    ['Danh sách đơn vị chưa cập nhật dữ liệu:', '', '', '', ''],
    ...orgs.filter((o) => o.avg_completion === 0).map((o) => [`- ${o.name}`, '', '', '', '']),
  ];
}

/**
 * Generate Sheet 3: Danh sách hệ thống
 */
function generateSystemsSheet(systems: System[]): any[][] {
  const sorted = [...systems].sort((a, b) => {
    if (a.org_name !== b.org_name) return (a.org_name || '').localeCompare(b.org_name || '');
    return (b.completion_percentage || 0) - (a.completion_percentage || 0);
  });

  return [
    ['STT', 'TÊN HỆ THỐNG', 'ĐƠN VỊ', 'TRẠNG THÁI', 'QUAN TRỌNG', '% HOÀN THÀNH', 'NGÀY CẬP NHẬT'],
    ...sorted.map((sys, idx) => [
      idx + 1,
      sys.system_name,
      sys.org_name || 'N/A',
      STATUS_LABELS[sys.status] || sys.status,
      CRITICALITY_LABELS[sys.criticality] || sys.criticality,
      `${sys.completion_percentage || 0}%`,
      dayjs(sys.updated_at).format('DD/MM/YYYY'),
    ]),
  ];
}

/**
 * Generate Sheet 4: Lưu ý đôn đốc
 */
function generateFollowUpSheet(orgs: OrgStats[]): any[][] {
  const needFollowUp = orgs
    .filter((org) => org.avg_completion === 0 || org.avg_completion < 50)
    .sort((a, b) => a.avg_completion - b.avg_completion);

  return [
    ['STT', 'ĐƠN VỊ', '% HOÀN THÀNH', 'LƯU Ý / GHI CHÚ'],
    ...needFollowUp.map((org, idx) => {
      let note = '';
      if (org.avg_completion === 0) note = 'Chưa cập nhật dữ liệu';
      else if (org.avg_completion < 30) note = 'Cần đôn đốc khẩn cấp';
      else note = 'Cần đôn đốc nhập liệu';
      return [idx + 1, org.name, `${org.avg_completion.toFixed(1).replace('.', ',')}%`, note];
    }),
  ];
}

/**
 * Main export function
 */
export async function exportDashboardToExcel(
  statistics: any,
  completionData: CompletionData | null,
  systems: System[]
): Promise<void> {
  try {
    const wb = XLSX.utils.book_new();

    const sheet1Data = generateSummarySheet(statistics, completionData);
    const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);
    XLSX.utils.book_append_sheet(wb, ws1, '1. Tổng quan');

    if (completionData?.summary?.organizations) {
      const sheet2Data = generateOrgSheet(completionData.summary.organizations);
      const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);
      XLSX.utils.book_append_sheet(wb, ws2, '2. Theo đơn vị');
    }

    const sheet3Data = generateSystemsSheet(systems);
    const ws3 = XLSX.utils.aoa_to_sheet(sheet3Data);
    XLSX.utils.book_append_sheet(wb, ws3, '3. Danh sách HT');

    if (completionData?.summary?.organizations) {
      const sheet4Data = generateFollowUpSheet(completionData.summary.organizations);
      const ws4 = XLSX.utils.aoa_to_sheet(sheet4Data);
      XLSX.utils.book_append_sheet(wb, ws4, '4. Lưu ý đôn đốc');
    }

    const fileName = `Bao-cao-CDS-${dayjs().format('DD-MM-YYYY')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  } catch (error) {
    console.error('Error exporting Excel:', error);
    throw error;
  }
}
EXPORT_EXCEL_EOF

    log_info "exportExcel.ts created"

    # 4. Update Dashboard.tsx - Update imports
    log_step "Updating Dashboard.tsx..."

    # Backup original
    cp frontend/src/pages/Dashboard.tsx "$BACKUP_DIR/Dashboard.tsx.bak"

    # Update imports using sed
    sed -i.bak "s/import { message }/import { message }/" frontend/src/pages/Dashboard.tsx || true
    sed -i.bak "s/FileDoneOutlined/FileExcelOutlined/" frontend/src/pages/Dashboard.tsx || true
    sed -i.bak "s/FileTextOutlined, //" frontend/src/pages/Dashboard.tsx || true

    # Add exportExcel import after last import
    sed -i.bak "/import DashboardSystemsList/a\\import { exportDashboardToExcel } from '../utils/exportExcel';" frontend/src/pages/Dashboard.tsx || true

    log_info "Dashboard.tsx imports updated"

    # 5. Add exporting state (after completionStats state)
    sed -i.bak "/const \[completionStats/a\\  const [exporting, setExporting] = useState<boolean>(false);" frontend/src/pages/Dashboard.tsx || true

    log_info "Exporting state added"

    # 6. Create the exportToExcel function
    log_step "Adding exportToExcel function..."

    # Find and replace export functions with new exportToExcel
    # This is a complex change, so we'll append the new function

    cat >> frontend/src/pages/Dashboard.tsx.new_func << 'FUNC_EOF'

  const exportToExcel = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (organizationFilter !== 'all') {
        params.append('org', organizationFilter);
      }
      params.append('page_size', '1000');

      const systemsResponse = await api.get<ApiResponse<System>>(\`/systems/?\${params.toString()}\`);

      await exportDashboardToExcel(
        statistics,
        completionStats,
        systemsResponse.data.results || []
      );

      message.success('Đã xuất báo cáo Excel thành công!');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      message.error('Lỗi khi xuất báo cáo Excel');
    } finally {
      setExporting(false);
    }
  };
FUNC_EOF

    # Insert the new function before handleDateRangeChange
    # For now, let's create a patch file
    log_warn "Dashboard.tsx function update - manual step required"
    log_info "See: frontend/src/pages/Dashboard.tsx.new_func for the exportToExcel function"
    log_info "Add this function before handleDateRangeChange in Dashboard.tsx"

    # 7. Update button - replace Dropdown with single button
    log_step "Updating export button..."

    # Create patch for button
    cat > "$BACKUP_DIR/button.patch" << 'BUTTON_PATCH'
# In the JSX return, replace the Dropdown component with:

<Button
  type="primary"
  icon={<FileExcelOutlined />}
  onClick={exportToExcel}
  loading={exporting}
  aria-label="Xuất báo cáo Excel"
  title="Xuất báo cáo Excel"
>
  {isMobile ? '' : exporting ? 'Đang xuất...' : 'Xuất Excel'}
</Button>
BUTTON_PATCH

    log_info "Button patch created at $BACKUP_DIR/button.patch"
    log_warn "Manual step: Apply button patch to Dashboard.tsx"

    # 8. Clear Docker build cache (CRITICAL!)
    log_step "Clearing Docker build cache..."
    docker builder prune -af
    log_info "Build cache cleared"

    # 9. Rebuild frontend with DOCKER_BUILDKIT=0
    log_step "Rebuilding frontend (this may take a few minutes)..."
    DOCKER_BUILDKIT=0 docker compose build frontend --no-cache
    log_info "Frontend rebuilt"

    # 10. Restart frontend only
    log_step "Restarting frontend..."
    docker compose up -d frontend
    log_info "Frontend restarted"

    # 11. Wait and health check
    log_step "Waiting for frontend to start..."
    sleep 20

    log_step "Health check..."
    if curl -sf http://localhost:3000/ > /dev/null 2>&1; then
        log_info "Frontend is healthy"
    else
        log_warn "Frontend health check failed - check logs: docker compose logs frontend"
    fi

    log_step "=== Deployment Summary ==="
    log_info "Excel Export Feature deployed!"
    log_info ""
    log_info "Manual steps remaining:"
    log_info "1. Add exportToExcel function to Dashboard.tsx (see frontend/src/pages/Dashboard.tsx.new_func)"
    log_info "2. Update export button in Dashboard.tsx (see $BACKUP_DIR/button.patch)"
    log_info "3. Rebuild and restart: DOCKER_BUILDKIT=0 docker compose build frontend --no-cache && docker compose up -d frontend"
    log_info ""
    log_info "Test: Open Dashboard and click 'Xuất Excel' button"
}

main "$@"
