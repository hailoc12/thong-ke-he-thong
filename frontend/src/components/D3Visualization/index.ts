/**
 * D3 Visualization Components
 * Export all D3-related components and utilities
 */

export { D3Table } from './D3Table';
export type {
  D3TableColumn,
  D3TableRow,
  D3TableData,
  D3PaginationConfig,
  D3TableProps,
  D3VisualizationData,
} from './types';

// Helper function to detect base URL based on current host
export const getBaseUrl = (): string => {
  if (typeof window === 'undefined') return '';

  const host = window.location.host;

  // UAT: mindmaid.ai or port 3002
  if (host.includes('mindmaid.ai') || host.includes(':3002')) {
    return 'https://hientrangcds.mindmaid.ai';
  }

  // Production: mst.gov.vn or port 3000
  return 'https://hientrangcds.mst.gov.vn';
};
