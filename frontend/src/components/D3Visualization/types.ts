/**
 * D3 Visualization Types
 * Type definitions for D3-based visualizations
 */

export interface D3TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'link';
  sortable?: boolean;
  searchable?: boolean;
}

export interface D3TableRow {
  [key: string]: any;
  _system_id?: number;      // For system detail links
  _organization_id?: number; // For organization links
}

export interface D3TableData {
  columns: D3TableColumn[];
  rows: D3TableRow[];
  totalRows: number;
}

export interface D3PaginationConfig {
  pageSize: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean;
}

export interface D3TableProps {
  data: D3TableData;
  pagination?: D3PaginationConfig;
  searchable?: boolean;
  sortable?: boolean;
  baseUrl?: string;  // For generating links (UAT vs Production)
  onRowClick?: (row: D3TableRow) => void;
  loading?: boolean;
}

export interface D3VisualizationData {
  type: 'table' | 'bar' | 'pie' | 'line';
  title?: string;
  data: D3TableData | any;  // Flexible for future chart types
  config?: {
    pagination?: D3PaginationConfig;
    baseUrl?: string;
    [key: string]: any;
  };
}
