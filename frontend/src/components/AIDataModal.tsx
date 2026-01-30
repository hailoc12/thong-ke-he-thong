import React, { useState, useMemo } from 'react';
import { Modal, Input, Select, Button, Space, Tag, Table } from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TableProps } from 'antd/es/table';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';

interface AIDataModalProps {
  visible: boolean;
  onClose: () => void;
  data: {
    columns: string[];
    rows: Record<string, any>[];
    total_rows: number;
  } | null;
}

const AIDataModal: React.FC<AIDataModalProps> = ({ visible, onClose, data }) => {
  const [searchText, setSearchText] = useState('');
  const [filteredInfo, setFilteredInfo] = useState<Record<string, FilterValue | null>>({});
  const [sortedInfo, setSortedInfo] = useState<SorterResult<any>>({});
  const [pageSize, setPageSize] = useState(20);

  // Filter data by search text
  const filteredData = useMemo(() => {
    if (!data?.rows) return [];
    if (!searchText) return data.rows;

    return data.rows.filter((row) =>
      Object.values(row).some(
        (value) =>
          String(value).toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [data?.rows, searchText]);

  // Generate columns with sort and filter
  const columns: ColumnsType<any> = useMemo(() => {
    if (!data?.columns) return [];

    return data.columns.map((col) => {
      const isNumeric = data.rows.some((row) => typeof row[col] === 'number');
      const isSystemName = ['name', 'system_name', 'ten_he_thong', 'tên hệ thống'].includes(
        col.toLowerCase()
      );

      // Get unique values for filter (limit to 20)
      const uniqueValues = [
        ...new Set(data.rows.map((r) => r[col]).filter(Boolean)),
      ].slice(0, 20) as string[];

      return {
        title: col,
        dataIndex: col,
        key: col,
        ellipsis: true,
        sorter: isNumeric
          ? (a, b) => (a[col] || 0) - (b[col] || 0)
          : (a, b) => String(a[col] || '').localeCompare(String(b[col] || '')),
        sortOrder: sortedInfo.columnKey === col ? sortedInfo.order : null,
        filters: uniqueValues.map((v) => ({ text: String(v), value: v })),
        filteredValue: filteredInfo[col] || null,
        onFilter: (value, record) => record[col] === value,
        render: (text, record) => {
          if (isSystemName && record.id) {
            return (
              <a
                href={`/systems/${record.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {text}
              </a>
            );
          }
          if (typeof text === 'number') {
            return text.toLocaleString('vi-VN');
          }
          return text ?? '-';
        },
      };
    });
  }, [data?.columns, data?.rows, sortedInfo, filteredInfo]);

  // Export to CSV
  const handleExport = () => {
    if (!data) return;

    const csvContent = [
      data.columns.join(','),
      ...data.rows.map((row) =>
        data.columns.map((col) => `"${row[col] ?? ''}"`).join(',')
      ),
    ].join('\n');

    // Add BOM for Excel UTF-8 compatibility
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ai_query_result_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleTableChange: TableProps<any>['onChange'] = (
    _pagination,
    filters,
    sorter
  ) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter as SorterResult<any>);
  };

  const handleClearFilters = () => {
    setFilteredInfo({});
    setSortedInfo({});
    setSearchText('');
  };

  return (
    <Modal
      title={
        <Space>
          <DatabaseOutlined style={{ color: '#722ed1' }} />
          <span>
            Kết quả truy vấn AI ({data?.total_rows || 0} bản ghi)
          </span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={1200}
      footer={[
        <Button
          key="export"
          icon={<DownloadOutlined />}
          onClick={handleExport}
          style={{ marginRight: 8 }}
        >
          Xuất CSV
        </Button>,
        <Button key="close" type="primary" onClick={onClose}>
          Đóng
        </Button>,
      ]}
      styles={{
        body: { padding: 16 }
      }}
    >
      {/* Toolbar */}
      <Space
        style={{ marginBottom: 16, width: '100%' }}
        wrap
      >
        <Input
          placeholder="Tìm kiếm..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 250 }}
          allowClear
        />
        <Select
          value={pageSize}
          onChange={setPageSize}
          options={[
            { value: 10, label: '10 / trang' },
            { value: 20, label: '20 / trang' },
            { value: 50, label: '50 / trang' },
            { value: 100, label: '100 / trang' },
          ]}
          style={{ width: 120 }}
        />
        <Button
          icon={<FilterOutlined />}
          onClick={handleClearFilters}
        >
          Xóa bộ lọc
        </Button>
        {searchText && (
          <Tag color="blue">
            Hiển thị {filteredData.length} / {data?.rows.length} kết quả
          </Tag>
        )}
      </Space>

      {/* Table */}
      <Table
        dataSource={filteredData.map((row, idx) => ({
          key: idx,
          ...row,
        }))}
        columns={columns}
        onChange={handleTableChange}
        pagination={{
          pageSize,
          showSizeChanger: false,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} / ${total}`,
        }}
        size="small"
        scroll={{ x: 'max-content', y: 400 }}
        bordered
      />
    </Modal>
  );
};

export default AIDataModal;
