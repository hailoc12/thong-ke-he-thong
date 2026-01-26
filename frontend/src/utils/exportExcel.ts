/**
 * Export Dashboard Statistics to Excel
 * Generates 4 sheets: Tổng quan, Theo đơn vị, Danh sách HT, Lưu ý đôn đốc
 */

import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import type { SystemStatistics } from '../types';

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

interface Organization {
  id: number;
  name: string;
}

/**
 * Merge all organizations with completion stats
 * Organizations without systems will have default values (0)
 */
function mergeOrganizationsWithCompletionStats(
  allOrganizations: Organization[],
  completionData: CompletionData | null
): OrgStats[] {
  // Create a map of organizations with completion data
  const orgsWithDataMap = new Map<number, OrgStats>();
  completionData?.summary?.organizations?.forEach((org) => {
    orgsWithDataMap.set(org.id, org);
  });

  // Merge: all organizations, with or without data
  return allOrganizations.map((org) => {
    const existingData = orgsWithDataMap.get(org.id);
    if (existingData) {
      return existingData;
    }
    // Organization has no systems - return default values
    return {
      id: org.id,
      name: org.name,
      system_count: 0,
      avg_completion: 0,
      systems_100_percent: 0,
      systems_below_50_percent: 0,
    };
  });
}

/**
 * Generate Sheet 1: Tổng quan
 */
function generateSummarySheet(
  statistics: SystemStatistics | null,
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
    // Title row
    ['BÁO CÁO TỔNG QUAN HỆ THỐNG CDS', '', '', `Ngày ${dayjs().format('DD/MM/YYYY')}`],
    [],
    // Header
    ['CHỈ TIÊU', 'GIÁ TRỊ', 'GHI CHÚ'],
    ['-----------------------------------------------------------------'],
    // Section 1: Theo trạng thái
    ['THEO TRẠNG THÁI', '', ''],
    ['1. Tổng số hệ thống', statistics?.total || 0, ''],
    ['2. Số hệ thống đang hoạt động', statistics?.by_status.operating || 0, `${getActiveRate()}%`],
    ['3. Số hệ thống thí điểm', statistics?.by_status.pilot || 0, `${getPilotRate()}%`],
    ['4. Số hệ thống dừng', statistics?.by_status.stopped || 0, ''],
    ['5. Số hệ thống sắp thay thế', statistics?.by_status.replacing || 0, ''],
    [],
    // Section 2: Theo mức độ
    ['THEO MỨC ĐỘ QUAN TRỌNG', '', ''],
    ['6. Cực kỳ quan trọng', statistics?.by_criticality.high || 0, `${getCriticalRate()}%`],
    ['7. Quan trọng', statistics?.by_criticality.medium || 0, ''],
    ['8. Trung bình', statistics?.by_criticality.low || 0, ''],
    ['9. Thấp', 0, ''],
    [],
    // Section 3: Theo trình độ nhập liệu
    ['THEO TRÌNH ĐỘ NHẬP LIỆU', '', ''],
    [
      '10. Tỷ lệ nhập liệu TB',
      `${statistics?.average_completion_percentage?.toFixed(1) || 0}%`,
      '',
    ],
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
  // Sort by avg_completion desc
  const sortedOrgs = [...orgs].sort((a, b) => b.avg_completion - a.avg_completion);

  // Vietnam time (UTC+7)
  const vnTime = dayjs().utcOffset(7).format('DD/MM HH:mm');

  // Calculate summary
  const summary = calculateOrgSummary(sortedOrgs);

  const data: any[][] = [
    // Header row 1
    ['STT', 'ĐƠN VỊ', 'TRẠNG THÁI', `TỶ LỆ NHẬP DỮ LIỆU TÍNH ĐẾN ${vnTime}`, ''],
    // Header row 2
    ['', '', '', 'Số hệ thống', '% hoàn thành trung bình'],
    [''],
    // Data rows
    ...sortedOrgs.map((org, idx) => [
      idx + 1,
      org.name,
      'Hoạt động',
      org.system_count > 0 ? org.system_count : 'Chưa có dữ liệu',
      org.avg_completion > 0
        ? org.avg_completion.toFixed(2).replace('.', ',')
        : 'Chưa có dữ liệu',
    ]),
    [''],
    // Summary section
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

  return data;
}

/**
 * Generate Sheet 3: Danh sách hệ thống
 */
function generateSystemsSheet(systems: any[]): any[][] {
  // Sort by org name, then by completion desc
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
  // Filter orgs needing follow-up
  const needFollowUp = orgs
    .filter((org) => {
      const noData = org.avg_completion === 0;
      const lowData = org.avg_completion < 50;
      return noData || lowData;
    })
    .sort((a, b) => a.avg_completion - b.avg_completion);

  return [
    ['STT', 'ĐƠN VỊ', '% HOÀN THÀNH', 'LƯU Ý / GHI CHÚ'],
    ...needFollowUp.map((org, idx) => {
      let note = '';
      if (org.avg_completion === 0) note = 'Chưa cập nhật dữ liệu';
      else if (org.avg_completion < 30) note = 'Cần đôn đốc khẩn cấp';
      else note = 'Cần đôn đốc nhập liệu';

      return [
        idx + 1,
        org.name,
        `${org.avg_completion.toFixed(1).replace('.', ',')}%`,
        note,
      ];
    }),
  ];
}

/**
 * Main export function
 */
export async function exportDashboardToExcel(
  statistics: SystemStatistics | null,
  completionData: CompletionData | null,
  systems: any[],
  allOrganizations: Organization[] = []
): Promise<void> {
  try {
    // Merge all organizations with completion stats
    const mergedOrgs = mergeOrganizationsWithCompletionStats(allOrganizations, completionData);

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Sheet 1: Tổng quan
    const sheet1Data = generateSummarySheet(statistics, completionData);
    const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);
    XLSX.utils.book_append_sheet(wb, ws1, '1. Tổng quan');

    // Sheet 2: Theo đơn vị - use merged organizations (includes those without systems)
    const sheet2Data = generateOrgSheet(mergedOrgs);
    const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);
    XLSX.utils.book_append_sheet(wb, ws2, '2. Theo đơn vị');

    // Sheet 3: Danh sách HT
    const sheet3Data = generateSystemsSheet(systems);
    const ws3 = XLSX.utils.aoa_to_sheet(sheet3Data);
    XLSX.utils.book_append_sheet(wb, ws3, '3. Danh sách HT');

    // Sheet 4: Lưu ý đôn đốc - use merged organizations
    const sheet4Data = generateFollowUpSheet(mergedOrgs);
    const ws4 = XLSX.utils.aoa_to_sheet(sheet4Data);
    XLSX.utils.book_append_sheet(wb, ws4, '4. Lưu ý đôn đốc');

    // Generate file
    const fileName = `Bao-cao-CDS-${dayjs().format('DD-MM-YYYY')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  } catch (error) {
    console.error('Error exporting Excel:', error);
    throw error;
  }
}
