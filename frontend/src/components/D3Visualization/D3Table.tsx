import React, { useState, useMemo, useEffect } from 'react';
import { Table, Input, Typography, Pagination } from 'antd';
import { SearchOutlined, LinkOutlined } from '@ant-design/icons';
import type { ColumnType } from 'antd/es/table';
import type { D3TableProps, D3TableRow } from './types';

const { Text } = Typography;

/**
 * D3Table Component
 * Interactive table with pagination, search, and sorting
 * Replaces backend-generated HTML with proper React component
 */
export const D3Table: React.FC<D3TableProps> = ({
  data,
  pagination = { pageSize: 10, showTotal: true },
  searchable = true,
  sortable = true,
  baseUrl,
  onRowClick,
  loading = false,
}) => {
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pagination.pageSize);

  // Reset pagination when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchText.trim()) return data.rows;

    const lowerSearch = searchText.toLowerCase();
    return data.rows.filter(row =>
      data.columns.some(col => {
        if (col.searchable === false) return false;
        const value = String(row[col.key] || '').toLowerCase();
        return value.includes(lowerSearch);
      })
    );
  }, [data.rows, data.columns, searchText]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, pageSize]);

  // Generate Ant Design columns from D3TableColumn
  const columns: ColumnType<D3TableRow>[] = useMemo(() => {
    return data.columns.map(col => {
      const column: ColumnType<D3TableRow> = {
        title: col.label,
        dataIndex: col.key,
        key: col.key,
        sorter: sortable && col.sortable !== false
          ? (a, b) => {
              const aVal = a[col.key];
              const bVal = b[col.key];
              if (typeof aVal === 'number' && typeof bVal === 'number') {
                return aVal - bVal;
              }
              return String(aVal || '').localeCompare(String(bVal || ''));
            }
          : undefined,
        render: (text, record) => {
          // Special handling for system links
          if (col.type === 'link' && record._system_id && baseUrl) {
            const systemUrl = `${baseUrl}/systems/${record._system_id}/`;
            return (
              <a
                href={systemUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#1677ff',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
                onClick={(e) => {
                  if (onRowClick) {
                    e.preventDefault();
                    onRowClick(record);
                  }
                }}
              >
                <span>{text}</span>
                <LinkOutlined style={{ fontSize: 12, opacity: 0.6 }} />
              </a>
            );
          }

          // Number formatting
          if (col.type === 'number' && typeof text === 'number') {
            return <Text>{text.toLocaleString('vi-VN')}</Text>;
          }

          return <Text>{text}</Text>;
        },
      };

      return column;
    });
  }, [data.columns, sortable, baseUrl, onRowClick]);

  return (
    <div className="d3-table-container" style={{ marginTop: 16 }}>
      {/* Header with Title and Total */}
      <div style={{
        background: 'linear-gradient(135deg, #1677ff 0%, #0958d9 100%)',
        color: 'white',
        padding: '16px 20px',
        borderRadius: '12px 12px 0 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 600 }}>
            📊 Danh sách chi tiết
          </span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 500 }}>
          {filteredData.length} kết quả
        </div>
      </div>

      {/* Search Box */}
      {searchable && (
        <div style={{
          padding: '12px 20px',
          background: '#fafafa',
          borderBottom: '1px solid #e8e8e8',
        }}>
          <Input
            placeholder="🔍 Tìm kiếm..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            allowClear
            style={{ width: 300 }}
          />
        </div>
      )}

      {/* Table */}
      <Table
        columns={columns}
        dataSource={paginatedData}
        pagination={false}
        loading={loading}
        rowKey={(record, index) => record._system_id || index || 0}
        size="middle"
        style={{
          background: 'white',
        }}
        locale={{
          emptyText: searchText ? 'Không tìm thấy kết quả' : 'Không có dữ liệu',
        }}
      />

      {/* Pagination */}
      {filteredData.length > pageSize && (
        <div style={{
          padding: '16px 20px',
          background: 'white',
          borderTop: '1px solid #f0f0f0',
          borderRadius: '0 0 12px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Hiển thị {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, filteredData.length)} / {filteredData.length} kết quả
          </Text>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredData.length}
            onChange={(page, newPageSize) => {
              setCurrentPage(page);
              if (newPageSize && newPageSize !== pageSize) {
                setPageSize(newPageSize);
                setCurrentPage(1);
              }
            }}
            showSizeChanger={pagination.showSizeChanger !== false}
            showQuickJumper={pagination.showQuickJumper}
            showTotal={pagination.showTotal ? (total, range) =>
              `${range[0]}-${range[1]} / ${total}` : undefined
            }
            pageSizeOptions={['10', '20', '50', '100']}
            locale={{
              items_per_page: '/ trang',
              jump_to: 'Đến',
              jump_to_confirm: 'xác nhận',
              page: 'trang',
              prev_page: 'Trang trước',
              next_page: 'Trang sau',
              prev_5: '5 trang trước',
              next_5: '5 trang sau',
              prev_3: '3 trang trước',
              next_3: '3 trang sau',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default D3Table;
