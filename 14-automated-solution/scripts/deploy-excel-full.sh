#!/usr/bin/env bash
# ============================================
# Deploy Excel Export Feature - Production
# Server: 34.142.152.104
# Run: bash deploy-excel-full.sh
# ============================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }
log_step() { echo -e "${BLUE}[STEP]${NC} $1"; }

APP_DIR="/opt/thong_ke_he_thong"
cd "$APP_DIR" || exit 1

# ============================================
# STEP 1: Create exportExcel.ts
# ============================================
log_step "Creating exportExcel.ts..."

cat > frontend/src/utils/exportExcel.ts << 'EOF'
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

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

function generateSummarySheet(stats: any, completion: any): any[][] {
  const total = stats?.total || 0;
  const getRate = (val: number) => total ? ((val/total)*100).toFixed(1) : '0';

  return [
    ['BÁO CÁO TỔNG QUAN HỆ THỐNG CDS', '', '', `Ngày ${dayjs().format('DD/MM/YYYY')}`],
    [],
    ['CHỈ TIÊU', 'GIÁ TRỊ', 'GHI CHÚ'],
    ['THEO TRẠNG THÁI', '', ''],
    ['1. Tổng số hệ thống', total, ''],
    ['2. Đang hoạt động', stats?.by_status?.operating || 0, `${getRate(stats?.by_status?.operating||0)}%`],
    ['3. Thí điểm', stats?.by_status?.pilot || 0, `${getRate(stats?.by_status?.pilot||0)}%`],
    ['4. Dừng', stats?.by_status?.stopped || 0, ''],
    ['5. Sắp thay thế', stats?.by_status?.replacing || 0, ''],
    [],
    ['THEO MỨC ĐỘ QUAN TRỌNG', '', ''],
    ['6. Cực kỳ quan trọng', stats?.by_criticality?.high || 0, `${getRate(stats?.by_criticality?.high||0)}%`],
    ['7. Quan trọng', stats?.by_criticality?.medium || 0, ''],
    ['8. Trung bình', stats?.by_criticality?.low || 0, ''],
    [],
    ['THEO TRÌNH ĐỘ NHẬP LIỆU', '', ''],
    ['10. Tỷ lệ TB', `${stats?.average_completion_percentage?.toFixed(1)||0}%`, ''],
    ['11. Hoàn thành 100%', completion?.summary?.systems_100_percent || 0, ''],
    ['12. Dưới 50%', completion?.summary?.systems_below_50_percent || 0, ''],
  ];
}

function generateOrgSheet(orgs: any[]): any[][] {
  const sorted = [...orgs].sort((a, b) => b.avg_completion - a.avg_completion);
  const time = dayjs().utcOffset(7).format('DD/MM HH:mm');

  const updated = sorted.filter(o => o.avg_completion > 0).length;
  const above80 = sorted.filter(o => o.avg_completion >= 80).length;
  const range60 = sorted.filter(o => o.avg_completion >= 60 && o.avg_completion < 80).length;
  const below60 = sorted.filter(o => o.avg_completion > 0 && o.avg_completion < 60).length;
  const below30 = sorted.filter(o => o.avg_completion > 0 && o.avg_completion < 30).length;

  return [
    ['STT', 'ĐƠN VỊ', 'TRẠNG THÁI', `TỶ LỆ NHẬP DỮ LIỆU TÍNH ĐẾN ${time}`, ''],
    ['', '', '', 'Số hệ thống', '% hoàn thành TB'],
    [''],
    ...sorted.map((o, i) => [
      i+1, o.name, 'Hoạt động',
      o.system_count || 'Chưa có DL',
      o.avg_completion > 0 ? o.avg_completion.toFixed(2).replace('.', ',') : 'Chưa có DL'
    ]),
    [''],
    [`Tổng hợp: ${orgs.length} Đơn vị`, '', '', '', ''],
    ['Đã cập nhật', '', '', '', ''],
    ['Trong đó:', '', '', '', ''],
    ['  > 80%', '', '', '', above80],
    ['  60-80%', '', '', '', range60],
    ['  < 60%', '', '', '', below60],
    ['  <30%', '', '', '', below30],
    ['Chưa cập nhật', '', '', '', orgs.length - updated],
    [''],
    ['Danh sách chưa CNDL:', '', '', '', ''],
    ...sorted.filter(o => o.avg_completion === 0).map(o => [`- ${o.name}`, '', '', '', '']),
  ];
}

function generateSystemsSheet(systems: any[]): any[][] {
  const sorted = [...systems].sort((a, b) => {
    if (a.org_name !== b.org_name) return (a.org_name||'').localeCompare(b.org_name||'');
    return (b.completion_percentage||0) - (a.completion_percentage||0);
  });

  return [
    ['STT', 'TÊN HỆ THỐNG', 'ĐƠN VỊ', 'TRẠNG THÁI', 'QUAN TRỌNG', '% HOÀN THÀNH', 'NGÀY CẬP NHẬT'],
    ...sorted.map((s, i) => [
      i+1, s.system_name, s.org_name||'N/A',
      STATUS_LABELS[s.status]||s.status,
      CRITICALITY_LABELS[s.criticality]||s.criticality,
      `${s.completion_percentage||0}%`,
      dayjs(s.updated_at).format('DD/MM/YYYY')
    ]),
  ];
}

function generateFollowUpSheet(orgs: any[]): any[][] {
  const filtered = orgs.filter(o => o.avg_completion < 50).sort((a, b) => a.avg_completion - b.avg_completion);

  return [
    ['STT', 'ĐƠN VỊ', '% HOÀN THÀNH', 'LƯU Ý'],
    ...filtered.map((o, i) => [
      i+1, o.name, `${o.avg_completion.toFixed(1).replace('.', ',')}%`,
      o.avg_completion === 0 ? 'Chưa CNDL' : o.avg_completion < 30 ? 'Đôn đốc khẩn' : 'Đôn đốc'
    ]),
  ];
}

export async function exportDashboardToExcel(stats: any, completion: any, systems: any[]) {
  const wb = XLSX.utils.book_new();

  const ws1 = XLSX.utils.aoa_to_sheet(generateSummarySheet(stats, completion));
  XLSX.utils.book_append_sheet(wb, ws1, '1. Tổng quan');

  if (completion?.summary?.organizations) {
    const ws2 = XLSX.utils.aoa_to_sheet(generateOrgSheet(completion.summary.organizations));
    XLSX.utils.book_append_sheet(wb, ws2, '2. Theo đơn vị');
  }

  const ws3 = XLSX.utils.aoa_to_sheet(generateSystemsSheet(systems));
  XLSX.utils.book_append_sheet(wb, ws3, '3. Danh sách HT');

  if (completion?.summary?.organizations) {
    const ws4 = XLSX.utils.aoa_to_sheet(generateFollowUpSheet(completion.summary.organizations));
    XLSX.utils.book_append_sheet(wb, ws4, '4. Lưu ý đôn đốc');
  }

  XLSX.writeFile(wb, `Bao-cao-CDS-${dayjs().format('DD-MM-YYYY')}.xlsx`);
}
EOF

log_info "exportExcel.ts created"

# ============================================
# STEP 2: Update Dashboard.tsx
# ============================================
log_step "Patching Dashboard.tsx..."

# Backup
cp frontend/src/pages/Dashboard.tsx frontend/src/pages/Dashboard.tsx.bak

# Patch using Python for reliable multi-line replacement
python3 << 'PYTHON_EOF'
import re

with open('frontend/src/pages/Dashboard.tsx', 'r') as f:
    content = f.read()

# 1. Update imports - add message and FileExcelOutlined
content = re.sub(
    r"import \{.*?Dropdown.*?\} from 'antd';",
    "import { Card, Row, Col, Statistic, Typography, Skeleton, Button, Space, Timeline, Badge, Select, DatePicker, Table, Progress, message } from 'antd';",
    content
)
content = re.sub(
    r"import \{.*?\} from '@ant-design/icons';",
    """import {
  AppstoreOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  TeamOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined,
  ReloadOutlined,
  DownloadOutlined,
  FilterOutlined,
  ClearOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';""",
    content
)

# 2. Add exportExcel import
content = re.sub(
    r"import DashboardSystemsList from '\.\./components/DashboardSystemsList';",
    "import DashboardSystemsList from '../components/DashboardSystemsList';\nimport { exportDashboardToExcel } from '../utils/exportExcel';",
    content
)

# 3. Add exporting state
content = re.sub(
    r"const \[completionStats, setCompletionStats\] = useState<any>\(null\);",
    "const [completionStats, setCompletionStats] = useState<any>(null);\n  const [exporting, setExporting] = useState(false);",
    content
)

# 4. Replace old export functions with new exportToExcel
export_func = '''  const exportToExcel = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (organizationFilter !== 'all') {
        params.append('org', organizationFilter);
      }
      params.append('page_size', '1000');

      const systemsResponse = await api.get<ApiResponse<System>>(`/systems/?${params.toString()}`);

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

  const handleDateRange'''

content = re.sub(
    r'  const exportToJSON = \(\) => \{.*?\n  \};\n\n  const exportToCSV = \(\) => \{.*?\n  \};\n\n',
    export_func,
    content,
    flags=re.DOTALL
)

# 5. Replace Dropdown button with single Excel button
old_button = '''          <Dropdown
            menu={{
              items: [
                {
                  key: 'json',
                  label: 'Xuất JSON',
                  icon: <FileDoneOutlined />,
                  onClick: exportToJSON,
                },
                {
                  key: 'csv',
                  label: 'Xuất CSV',
                  icon: <FileTextOutlined />,
                  onClick: exportToCSV,
                },
              ],
            }}
            placement="bottomRight"
          >
            <Button
              icon={<DownloadOutlined />}
              aria-label="Xuất báo cáo dashboard"
              title="Xuất báo cáo"
            >
              {isMobile ? '' : 'Xuất báo cáo'}
            </Button>
          </Dropdown>'''

new_button = '''          <Button
            type="primary"
            icon={<FileExcelOutlined />}
            onClick={exportToExcel}
            loading={exporting}
            aria-label="Xuất báo cáo Excel"
            title="Xuất báo cáo Excel"
          >
            {isMobile ? '' : exporting ? 'Đang xuất...' : 'Xuất Excel'}
          </Button>'''

content = content.replace(old_button, new_button)

with open('frontend/src/pages/Dashboard.tsx', 'w') as f:
    f.write(content)

print("Dashboard.tsx patched successfully")
PYTHON_EOF

log_info "Dashboard.tsx updated"

# ============================================
# STEP 3: Install xlsx package
# ============================================
log_step "Installing xlsx package..."
cd frontend
npm install xlsx
cd ..
log_info "xlsx installed"

# ============================================
# STEP 4: Clear Docker build cache
# ============================================
log_step "Clearing Docker build cache (CRITICAL)..."
docker builder prune -af

# ============================================
# STEP 5: Rebuild frontend
# ============================================
log_step "Rebuilding frontend..."
DOCKER_BUILDKIT=0 docker compose build frontend --no-cache

# ============================================
# STEP 6: Restart frontend
# ============================================
log_step "Restarting frontend..."
docker compose up -d frontend

# ============================================
# STEP 7: Health check
# ============================================
log_step "Health check..."
sleep 15
if curl -sf http://localhost:3000/ > /dev/null 2>&1; then
    log_info "✓ Frontend is healthy!"
else
    log_warn "⚠ Frontend check failed - check: docker compose logs frontend --tail 50"
fi

# ============================================
# DONE
# ============================================
log_step "=== DEPLOYMENT COMPLETE ==="
log_info ""
log_info "Test steps:"
log_info "1. Open Dashboard at http://34.142.152.104:3000"
log_info "2. Click 'Xuất Excel' button (blue primary button)"
log_info "3. Verify file downloads with 4 sheets"
