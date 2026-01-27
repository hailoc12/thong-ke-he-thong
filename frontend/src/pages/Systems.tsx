import { useState, useEffect } from 'react';
import { Table, Button, Space, Typography, Tag, Input, Empty, Popconfirm, message, Progress, Tooltip, Modal, Radio, Spin } from 'antd';
import { PlusOutlined, SearchOutlined, InboxOutlined, DeleteOutlined, ExclamationCircleOutlined, EyeOutlined, EditOutlined, DownloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import api from '../config/api';
import { useAuthStore } from '../stores/authStore';
import type { System, ApiResponse, SystemDetail } from '../types';
import { exportSystemsDetailToExcel } from '../utils/exportSystemsDetailToExcel';

const { Title } = Typography;

const Systems = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuthStore();
  const [systems, setSystems] = useState<System[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [exportOption, setExportOption] = useState<'all' | 'filtered'>('all');
  const [exporting, setExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchSystems();
  }, []);

  const fetchSystems = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse<System>>('/systems/', {
        params: {
          page,
          search,
        },
      });
      setSystems(response.data.results || []);
      setPagination({
        current: page,
        pageSize: 20,
        total: response.data.count || 0,
      });
    } catch (error) {
      console.error('Failed to fetch systems:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination: any) => {
    fetchSystems(pagination.current);
  };

  const handleDelete = async (id: number, name: string) => {
    try {
      await api.delete(`/systems/${id}/`);
      message.success(`Đã xóa hệ thống "${name}" thành công`);
      fetchSystems(pagination.current);
    } catch (error: any) {
      console.error('Failed to delete system:', error);
      const errorMessage = error.response?.data?.error || 'Có lỗi xảy ra khi xóa hệ thống';
      message.error(errorMessage, 8);
    }
  };

  const canDeleteSystem = (system: System): boolean => {
    // Admin can delete any system
    if (isAdmin) return true;
    // Org user can only delete systems in their organization
    if (user && system.org === user.organization) return true;
    return false;
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      // Fetch full data for export
      const params: Record<string, string> = {};
      if (exportOption === 'filtered' && searchQuery) {
        params.search = searchQuery;
      }

      const response = await api.get<{ count: number; results: SystemDetail[] }>('/systems/export_data/', { params });
      const systemsToExport = response.data.results || [];

      if (systemsToExport.length === 0) {
        message.warning('Không có dữ liệu để xuất');
        return;
      }

      await exportSystemsDetailToExcel(systemsToExport);
      message.success(`Đã xuất ${systemsToExport.length} hệ thống ra file Excel`);
      setExportModalVisible(false);
    } catch (error) {
      console.error('Export error:', error);
      message.error('Có lỗi xảy ra khi xuất file Excel');
    } finally {
      setExporting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'green',
      operating: 'green',
      inactive: 'red',
      maintenance: 'orange',
      planning: 'blue',
      draft: 'default',
    };
    return colors[status.toLowerCase()] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { full: string; short: string }> = {
      active: { full: 'Hoạt động', short: 'Hoạt động' },
      operating: { full: 'Hoạt động', short: 'Hoạt động' },
      inactive: { full: 'Ngưng', short: 'Ngưng' },
      maintenance: { full: 'Bảo trì', short: 'Bảo trì' },
      planning: { full: 'Lập kế hoạch', short: 'Kế hoạch' },
      draft: { full: 'Bản nháp', short: 'Nháp' },
    };
    return labels[status.toLowerCase()] || { full: status, short: status };
  };

  const getCriticalityColor = (level: string) => {
    const colors: Record<string, string> = {
      critical: 'red',
      high: 'orange',
      medium: 'blue',
      low: 'green',
    };
    return colors[level] || 'default';
  };

  const getCompletionColor = (percentage: number): string => {
    if (percentage === 100) return '#22C55E';
    if (percentage >= 76) return '#84CC16';
    if (percentage >= 51) return '#FBBF24';
    if (percentage >= 26) return '#F59E0B';
    return '#EF4444';
  };

  // Build columns - hide "Đơn vị" for org users since they only see their own org
  const allColumns: ColumnsType<System> = [
    {
      title: isMobile ? 'Mã' : 'Mã hệ thống',
      dataIndex: 'system_code',
      key: 'system_code',
      width: isMobile ? 80 : 120,
      ellipsis: { showTitle: true },
    },
    {
      title: 'Tên hệ thống',
      dataIndex: 'system_name',
      key: 'system_name',
      width: isMobile ? 150 : 280,
      ellipsis: { showTitle: true },
    },
    // Only show "Đơn vị" column for admin users
    ...(isAdmin ? [{
      title: 'Đơn vị',
      dataIndex: 'org_name',
      key: 'org_name',
      width: 180,
      ellipsis: { showTitle: true },
    }] : []),
    {
      title: isMobile ? 'TT' : 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: isMobile ? 80 : 110,
      align: 'center',
      render: (status: string) => {
        const label = getStatusLabel(status);
        return (
          <Tag color={getStatusColor(status)}>
            {isMobile ? label.short : label.full}
          </Tag>
        );
      },
    },
    {
      title: 'Mức độ',
      dataIndex: 'criticality_level',
      key: 'criticality_level',
      width: 100,
      align: 'center',
      responsive: ['xl'] as any,
      render: (level: string, record: System) => (
        <Tag color={getCriticalityColor(level)}>
          {record.criticality_display}
        </Tag>
      ),
    },
    {
      title: isMobile ? '%' : '% Hoàn thành',
      dataIndex: 'completion_percentage',
      key: 'completion_percentage',
      width: isMobile ? 80 : 160,
      sorter: (a, b) => (a.completion_percentage || 0) - (b.completion_percentage || 0),
      render: (value: number) => {
        const percentage = value || 0;
        return (
          <Tooltip title={`${percentage.toFixed(1)}%`}>
            <Progress
              percent={Math.round(percentage)}
              strokeColor={getCompletionColor(percentage)}
              size="small"
              format={(p) => `${p}%`}
            />
          </Tooltip>
        );
      },
    },
    {
      title: '',
      key: 'action',
      width: isMobile ? 90 : 120,
      align: 'center',
      render: (_: any, record: System) => (
        <Space size={isMobile ? 4 : 8}>
          <Tooltip title="Xem chi tiết">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/systems/${record.id}`)}
            >
              {!isMobile && 'Xem'}
            </Button>
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => navigate(`/systems/${record.id}/edit`)}
            >
              {!isMobile && 'Sửa'}
            </Button>
          </Tooltip>
          {canDeleteSystem(record) && (
            <Popconfirm
              title="Xóa hệ thống"
              description={
                <div style={{ maxWidth: 300 }}>
                  <p>Bạn có chắc chắn muốn xóa hệ thống <strong>"{record.system_name}"</strong>?</p>
                  <p style={{ color: '#ff4d4f', marginTop: 8, marginBottom: 0 }}>
                    <ExclamationCircleOutlined /> Thao tác này KHÔNG THỂ HOÀN TÁC!
                  </p>
                </div>
              }
              onConfirm={() => handleDelete(record.id, record.system_name)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Xóa">
                <Button type="text" danger size="small" icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: isMobile ? 12 : 0,
        marginBottom: 16
      }}>
        <Title level={isMobile ? 3 : 2} style={{ margin: 0 }}>
          Danh sách Hệ thống
        </Title>
        <Space>
          <Button
            icon={<DownloadOutlined />}
            onClick={() => setExportModalVisible(true)}
          >
            {isMobile ? '' : 'Xuất Excel'}
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/systems/create')} block={isMobile}>
            {isMobile ? 'Thêm' : 'Thêm hệ thống'}
          </Button>
        </Space>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder={isMobile ? "Tìm kiếm..." : "Tìm kiếm theo tên, mã hệ thống..."}
          prefix={<SearchOutlined />}
          style={{ width: isMobile ? '100%' : 300 }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onPressEnter={(e) => fetchSystems(1, (e.target as HTMLInputElement).value)}
        />
      </div>

      <Table
        columns={allColumns}
        dataSource={systems}
        rowKey="id"
        loading={loading}
        size={isMobile ? 'small' : 'middle'}
        className="systems-table"
        locale={{
          emptyText: (
            <Empty
              image={<InboxOutlined style={{ fontSize: 48, color: '#bfbfbf' }} />}
              description={
                <span style={{ color: '#8c8c8c' }}>
                  Chưa có hệ thống nào
                </span>
              }
            >
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/systems/create')}>
                Thêm hệ thống
              </Button>
            </Empty>
          ),
        }}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Tổng ${total} hệ thống`,
        }}
        onChange={handleTableChange}
        scroll={{ x: isMobile ? 'max-content' : 900 }}
      />

      {/* Export Modal */}
      <Modal
        title="Xuất dữ liệu Hệ thống ra Excel"
        open={exportModalVisible}
        onOk={handleExport}
        onCancel={() => setExportModalVisible(false)}
        okText={exporting ? 'Đang xuất...' : 'Xuất file'}
        cancelText="Hủy"
        confirmLoading={exporting}
        okButtonProps={{ disabled: exporting }}
      >
        <Spin spinning={exporting} tip="Đang tải dữ liệu và tạo file Excel...">
          <div style={{ padding: '16px 0' }}>
            <Radio.Group
              value={exportOption}
              onChange={(e) => setExportOption(e.target.value)}
              disabled={exporting}
            >
              <Space direction="vertical">
                <Radio value="all">
                  Xuất tất cả hệ thống ({pagination.total} hệ thống)
                </Radio>
                <Radio value="filtered" disabled={!searchQuery}>
                  Chỉ xuất kết quả tìm kiếm {searchQuery ? `(từ khóa: "${searchQuery}")` : '(nhập từ khóa tìm kiếm trước)'}
                </Radio>
              </Space>
            </Radio.Group>

            <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 6 }}>
              <Typography.Text type="secondary">
                <strong>Lưu ý:</strong> File Excel sẽ bao gồm tất cả thông tin chi tiết của hệ thống, được chia thành nhiều sheet theo từng danh mục (Cơ bản, Nghiệp vụ, Kiến trúc, Dữ liệu, Tích hợp, Bảo mật, Hạ tầng, Vận hành, Đánh giá, và các sheet Level 2 nếu có).
              </Typography.Text>
            </div>
          </div>
        </Spin>
      </Modal>
    </div>
  );
};

export default Systems;
