# Frontend Component Architecture: System Visualization

**Date**: 2026-01-24
**Tech Stack**: React + TypeScript + Tailwind + React Query + Zustand
**Purpose**: Complete frontend architecture for interactive architecture visualization

---

## Component Tree

```
<SystemArchitectureVisualizationPage>
│
├── <PageHeader>
│   ├── <Title>
│   └── <LastUpdated>
│
├── <ControlBar>
│   ├── <ViewModeToggle>         // Accordion | Diagram
│   ├── <SearchInput>
│   ├── <FilterDropdown>         // Layer filter
│   ├── <StatusFilterDropdown>   // Status filter
│   └── <ExportButton>
│
├── <MetricsSummary>
│   ├── <OverallCompletion>
│   ├── <HealthRate>
│   └── <TotalSystems>
│
├── {viewMode === 'accordion' ?
│   <AccordionView>
│   : <DiagramView>}
│
├── <SystemDetailModal>          // Conditional render
│
└── <LoadingState> | <ErrorState>
```

---

## File Structure

```
frontend/src/
├── pages/
│   └── LeaderDashboard/
│       └── SystemArchitecture/
│           └── index.tsx                      # Main page component
│
├── features/
│   └── architecture-visualization/
│       ├── components/
│       │   ├── AccordionView/
│       │   │   ├── AccordionView.tsx
│       │   │   ├── LayerAccordion.tsx
│       │   │   ├── ClusterAccordion.tsx
│       │   │   ├── SystemCard.tsx
│       │   │   └── index.ts
│       │   │
│       │   ├── DiagramView/
│       │   │   ├── DiagramView.tsx           # Optional toggle view
│       │   │   ├── LayerBlock.tsx
│       │   │   ├── ComponentBlock.tsx
│       │   │   └── index.ts
│       │   │
│       │   ├── ControlBar/
│       │   │   ├── ControlBar.tsx
│       │   │   ├── ViewModeToggle.tsx
│       │   │   ├── SearchInput.tsx
│       │   │   ├── FilterDropdown.tsx
│       │   │   └── index.ts
│       │   │
│       │   ├── SystemDetailModal/
│       │   │   ├── SystemDetailModal.tsx
│       │   │   ├── SystemInfo.tsx
│       │   │   ├── SystemDependencies.tsx
│       │   │   └── index.ts
│       │   │
│       │   └── MetricsSummary/
│       │       ├── MetricsSummary.tsx
│       │       ├── MetricCard.tsx
│       │       └── index.ts
│       │
│       ├── hooks/
│       │   ├── useArchitectureLayers.ts       # React Query hook
│       │   ├── useArchitectureComponents.ts
│       │   ├── useArchitectureSystems.ts
│       │   ├── useSystemDetail.ts
│       │   └── useArchitectureMetrics.ts
│       │
│       ├── store/
│       │   └── architectureStore.ts           # Zustand store
│       │
│       ├── types/
│       │   └── architecture.ts                # TypeScript types
│       │
│       └── utils/
│           ├── formatters.ts                  # Format completion rate, etc
│           ├── statusHelpers.ts               # Status badge helpers
│           └── exportHelpers.ts               # Export to PNG/PDF
│
└── api/
    └── architecture/
        └── index.ts                            # API client functions
```

---

## TypeScript Types

File: `features/architecture-visualization/types/architecture.ts`

```typescript
// ===== Enums =====
export enum DeploymentStatus {
  PLANNED = 'planned',
  IN_DEVELOPMENT = 'in_development',
  TESTING = 'testing',
  STAGING = 'staging',
  PRODUCTION = 'production',
  DEPRECATED = 'deprecated'
}

export enum HealthStatus {
  UNKNOWN = 'unknown',
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  DOWN = 'down',
  MAINTENANCE = 'maintenance'
}

export enum ViewMode {
  ACCORDION = 'accordion',
  DIAGRAM = 'diagram'
}

// ===== Layer =====
export interface ArchitectureLayer {
  id: number;
  code: string;
  name_vi: string;
  name_en?: string;
  description_vi?: string;
  color_code: string;
  icon?: string;
  display_order: number;
  metrics: LayerMetrics;
}

export interface LayerMetrics {
  total_systems: number;
  production_systems: number;
  healthy_systems: number;
  completion_rate: number;
}

// ===== Component =====
export interface ArchitectureComponent {
  id: number;
  code: string;
  name_vi: string;
  name_en?: string;
  description_vi?: string;
  icon?: string;
  color_code?: string;
  layer: {
    id: number;
    code: string;
    name_vi: string;
    color_code: string;
  };
  parent_component_id?: number;
  display_order: number;
  metrics: ComponentMetrics;
  children?: ArchitectureComponent[];
}

export interface ComponentMetrics {
  total_systems: number;
  production_systems: number;
  in_development_systems?: number;
}

// ===== System =====
export interface ArchitectureSystem {
  id: number;
  name: string;
  code: string;
  organization_name: string;
  department_name?: string;
  deployment_status: DeploymentStatus;
  health_status: HealthStatus;
  architecture: {
    layer?: {
      id: number;
      code: string;
      name_vi: string;
    };
    component?: {
      id: number;
      code: string;
      name_vi: string;
    };
  };
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SystemDetail extends ArchitectureSystem {
  description?: string;
  dependencies: {
    uses: SystemDependency[];
    used_by: SystemDependency[];
  };
  architecture: {
    layer?: {
      id: number;
      code: string;
      name_vi: string;
      color_code: string;
    };
    component?: {
      id: number;
      code: string;
      name_vi: string;
      parent?: {
        id: number;
        code: string;
        name_vi: string;
      };
    };
  };
}

export interface SystemDependency {
  id: number;
  name: string;
  code: string;
  dependency_type: string;
  is_critical: boolean;
}

// ===== Filters =====
export interface ArchitectureFilters {
  search: string;
  layerId: number | null;
  deploymentStatus: DeploymentStatus[];
  healthStatus: HealthStatus[];
}

// ===== State =====
export interface ArchitectureState {
  viewMode: ViewMode;
  filters: ArchitectureFilters;
  expandedLayers: Set<number>;
  expandedClusters: Set<number>;
  selectedSystemId: number | null;
  isModalOpen: boolean;
}
```

---

## Zustand Store

File: `features/architecture-visualization/store/architectureStore.ts`

```typescript
import { create } from 'zustand';
import { ViewMode, ArchitectureFilters, DeploymentStatus, HealthStatus } from '../types/architecture';

interface ArchitectureStore {
  // View mode
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Filters
  filters: ArchitectureFilters;
  setSearch: (search: string) => void;
  setLayerFilter: (layerId: number | null) => void;
  setDeploymentStatusFilter: (statuses: DeploymentStatus[]) => void;
  setHealthStatusFilter: (statuses: HealthStatus[]) => void;
  resetFilters: () => void;

  // Expansion state
  expandedLayers: Set<number>;
  toggleLayer: (layerId: number) => void;
  expandedClusters: Set<number>;
  toggleCluster: (clusterId: number) => void;

  // Selected system
  selectedSystemId: number | null;
  isModalOpen: boolean;
  openSystemDetail: (systemId: number) => void;
  closeSystemDetail: () => void;
}

export const useArchitectureStore = create<ArchitectureStore>((set) => ({
  // Initial state
  viewMode: ViewMode.ACCORDION,
  filters: {
    search: '',
    layerId: null,
    deploymentStatus: [],
    healthStatus: []
  },
  expandedLayers: new Set(),
  expandedClusters: new Set(),
  selectedSystemId: null,
  isModalOpen: false,

  // Actions
  setViewMode: (mode) => set({ viewMode: mode }),

  setSearch: (search) =>
    set((state) => ({
      filters: { ...state.filters, search }
    })),

  setLayerFilter: (layerId) =>
    set((state) => ({
      filters: { ...state.filters, layerId }
    })),

  setDeploymentStatusFilter: (statuses) =>
    set((state) => ({
      filters: { ...state.filters, deploymentStatus: statuses }
    })),

  setHealthStatusFilter: (statuses) =>
    set((state) => ({
      filters: { ...state.filters, healthStatus: statuses }
    })),

  resetFilters: () =>
    set({
      filters: {
        search: '',
        layerId: null,
        deploymentStatus: [],
        healthStatus: []
      }
    }),

  toggleLayer: (layerId) =>
    set((state) => {
      const newExpanded = new Set(state.expandedLayers);
      if (newExpanded.has(layerId)) {
        newExpanded.delete(layerId);
      } else {
        newExpanded.add(layerId);
      }
      return { expandedLayers: newExpanded };
    }),

  toggleCluster: (clusterId) =>
    set((state) => {
      const newExpanded = new Set(state.expandedClusters);
      if (newExpanded.has(clusterId)) {
        newExpanded.delete(clusterId);
      } else {
        newExpanded.add(clusterId);
      }
      return { expandedClusters: newExpanded };
    }),

  openSystemDetail: (systemId) =>
    set({
      selectedSystemId: systemId,
      isModalOpen: true
    }),

  closeSystemDetail: () =>
    set({
      selectedSystemId: null,
      isModalOpen: false
    })
}));
```

---

## React Query Hooks

File: `features/architecture-visualization/hooks/useArchitectureLayers.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { architectureApi } from '@/api/architecture';
import type { ArchitectureLayer } from '../types/architecture';

export const useArchitectureLayers = () => {
  return useQuery<ArchitectureLayer[]>({
    queryKey: ['architecture', 'layers'],
    queryFn: architectureApi.getLayers,
    staleTime: 1000 * 60 * 60, // 1 hour
    cacheTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};
```

File: `features/architecture-visualization/hooks/useArchitectureComponents.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { architectureApi } from '@/api/architecture';
import type { ArchitectureComponent } from '../types/architecture';

export const useArchitectureComponents = (
  layerId?: number,
  includeChildren: boolean = false
) => {
  return useQuery<ArchitectureComponent[]>({
    queryKey: ['architecture', 'components', layerId, includeChildren],
    queryFn: () => architectureApi.getComponents(layerId, includeChildren),
    enabled: !!layerId, // Only fetch when layerId is provided
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};
```

File: `features/architecture-visualization/hooks/useArchitectureSystems.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { architectureApi } from '@/api/architecture';
import type { ArchitectureSystem } from '../types/architecture';
import { useArchitectureStore } from '../store/architectureStore';

export const useArchitectureSystems = (componentId?: number) => {
  const filters = useArchitectureStore((state) => state.filters);

  return useQuery<{ data: ArchitectureSystem[]; meta: any }>({
    queryKey: ['architecture', 'systems', componentId, filters],
    queryFn: () =>
      architectureApi.getSystems({
        componentId,
        ...filters,
      }),
    enabled: !!componentId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
```

File: `features/architecture-visualization/hooks/useSystemDetail.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { architectureApi } from '@/api/architecture';
import type { SystemDetail } from '../types/architecture';

export const useSystemDetail = (systemId: number | null) => {
  return useQuery<SystemDetail>({
    queryKey: ['architecture', 'system', systemId],
    queryFn: () => architectureApi.getSystemDetail(systemId!),
    enabled: !!systemId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
```

---

## API Client

File: `api/architecture/index.ts`

```typescript
import axios from 'axios';
import type {
  ArchitectureLayer,
  ArchitectureComponent,
  ArchitectureSystem,
  SystemDetail,
  ArchitectureFilters
} from '@/features/architecture-visualization/types/architecture';

const API_BASE = '/api/v1';

export const architectureApi = {
  async getLayers(): Promise<ArchitectureLayer[]> {
    const { data } = await axios.get(`${API_BASE}/architecture/layers`);
    return data.data;
  },

  async getComponents(
    layerId?: number,
    includeChildren: boolean = false
  ): Promise<ArchitectureComponent[]> {
    const params = new URLSearchParams();
    if (layerId) params.append('layer_id', layerId.toString());
    params.append('include_children', includeChildren.toString());

    const { data } = await axios.get(
      `${API_BASE}/architecture/components?${params}`
    );
    return data.data;
  },

  async getSystems(options: {
    componentId?: number;
    search?: string;
    layerId?: number | null;
    deploymentStatus?: string[];
    healthStatus?: string[];
    page?: number;
    limit?: number;
  }): Promise<{ data: ArchitectureSystem[]; meta: any }> {
    const params = new URLSearchParams();

    if (options.componentId)
      params.append('component_id', options.componentId.toString());
    if (options.search) params.append('search', options.search);
    if (options.layerId) params.append('layer_id', options.layerId.toString());
    if (options.deploymentStatus?.length)
      options.deploymentStatus.forEach((s) =>
        params.append('deployment_status', s)
      );
    if (options.healthStatus?.length)
      options.healthStatus.forEach((s) => params.append('health_status', s));
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());

    const { data } = await axios.get(
      `${API_BASE}/architecture/systems?${params}`
    );
    return data;
  },

  async getSystemDetail(systemId: number): Promise<SystemDetail> {
    const { data } = await axios.get(
      `${API_BASE}/architecture/systems/${systemId}`
    );
    return data.data;
  },

  async getMetrics(period: string = '7d', layerId?: number) {
    const params = new URLSearchParams({ period });
    if (layerId) params.append('layer_id', layerId.toString());

    const { data } = await axios.get(
      `${API_BASE}/architecture/metrics?${params}`
    );
    return data.data;
  },

  async getSummary() {
    const { data } = await axios.get(`${API_BASE}/architecture/summary`);
    return data.data;
  }
};
```

---

## Main Components

### LayerAccordion.tsx

```typescript
import { FC } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useArchitectureStore } from '../store/architectureStore';
import { useArchitectureComponents } from '../hooks/useArchitectureComponents';
import type { ArchitectureLayer } from '../types/architecture';
import { ClusterAccordion } from './ClusterAccordion';

interface Props {
  layer: ArchitectureLayer;
}

export const LayerAccordion: FC<Props> = ({ layer }) => {
  const { expandedLayers, toggleLayer } = useArchitectureStore();
  const isExpanded = expandedLayers.has(layer.id);

  const { data: components, isLoading } = useArchitectureComponents(
    isExpanded ? layer.id : undefined,
    false // Don't include children yet
  );

  const completionRate = layer.metrics.completion_rate;
  const completionColor =
    completionRate >= 90
      ? 'bg-green-500'
      : completionRate >= 70
      ? 'bg-yellow-500'
      : 'bg-red-500';

  return (
    <div className="border border-gray-200 rounded-lg mb-3">
      {/* Layer Header */}
      <button
        onClick={() => toggleLayer(layer.id)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        style={{ borderLeft: `4px solid ${layer.color_code}` }}
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-500" />
          )}

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">
              {layer.code}
            </span>
            <span className="text-lg font-semibold text-gray-900">
              {layer.name_vi}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Metrics */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>
              {layer.metrics.production_systems}/{layer.metrics.total_systems}
            </span>
            <span className="text-gray-400">systems</span>
          </div>

          {/* Completion Rate */}
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${completionColor} transition-all`}
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-700">
              {completionRate.toFixed(0)}%
            </span>
          </div>
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 bg-gray-50 space-y-2">
              {isLoading ? (
                <div className="text-sm text-gray-500">Loading...</div>
              ) : (
                components?.map((component) => (
                  <ClusterAccordion
                    key={component.id}
                    component={component}
                    layerColor={layer.color_code}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
```

### SystemCard.tsx

```typescript
import { FC } from 'react';
import { Server, AlertCircle, CheckCircle } from 'lucide-react';
import { useArchitectureStore } from '../store/architectureStore';
import type { ArchitectureSystem } from '../types/architecture';

interface Props {
  system: ArchitectureSystem;
}

const statusIcons = {
  healthy: <CheckCircle className="w-4 h-4 text-green-500" />,
  degraded: <AlertCircle className="w-4 h-4 text-yellow-500" />,
  down: <AlertCircle className="w-4 h-4 text-red-500" />,
  unknown: <AlertCircle className="w-4 h-4 text-gray-400" />,
  maintenance: <Server className="w-4 h-4 text-blue-500" />
};

export const SystemCard: FC<Props> = ({ system }) => {
  const { openSystemDetail } = useArchitectureStore();

  return (
    <button
      onClick={() => openSystemDetail(system.id)}
      className="w-full px-3 py-2 flex items-center justify-between bg-white border border-gray-200 rounded hover:border-blue-500 hover:shadow-sm transition-all text-left"
    >
      <div className="flex items-center gap-2">
        <Server className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-900">
          {system.name}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Deployment Status Badge */}
        <span
          className={`px-2 py-0.5 text-xs rounded-full ${
            system.deployment_status === 'production'
              ? 'bg-green-100 text-green-700'
              : system.deployment_status === 'in_development'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {system.deployment_status}
        </span>

        {/* Health Status Icon */}
        {statusIcons[system.health_status]}
      </div>
    </button>
  );
};
```

### SystemDetailModal.tsx

```typescript
import { FC } from 'react';
import { Dialog } from '@headlessui/react';
import { X, ExternalLink, Server } from 'lucide-react';
import { useArchitectureStore } from '../store/architectureStore';
import { useSystemDetail } from '../hooks/useSystemDetail';

export const SystemDetailModal: FC = () => {
  const { selectedSystemId, isModalOpen, closeSystemDetail } =
    useArchitectureStore();

  const { data: system, isLoading } = useSystemDetail(selectedSystemId);

  if (!isModalOpen || !selectedSystemId) return null;

  return (
    <Dialog open={isModalOpen} onClose={closeSystemDetail} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-3xl w-full bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              {system?.name || 'Loading...'}
            </Dialog.Title>
            <button
              onClick={closeSystemDetail}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="px-6 py-8 text-center text-gray-500">
              Loading system details...
            </div>
          ) : system ? (
            <div className="px-6 py-4 space-y-6">
              {/* Status */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-500">Status:</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    system.health_status === 'healthy'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {system.health_status}
                </span>
              </div>

              {/* Architecture Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Architecture
                </h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>
                    Layer: <strong>{system.architecture.layer?.name_vi}</strong>
                  </div>
                  <div>
                    Component:{' '}
                    <strong>{system.architecture.component?.name_vi}</strong>
                  </div>
                </div>
              </div>

              {/* Dependencies */}
              {system.dependencies && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Dependencies
                  </h3>

                  <div className="space-y-3">
                    {/* Uses */}
                    {system.dependencies.uses.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Uses:</p>
                        <div className="space-y-1">
                          {system.dependencies.uses.map((dep) => (
                            <div
                              key={dep.id}
                              className="text-sm text-gray-700 flex items-center gap-2"
                            >
                              <Server className="w-4 h-4 text-gray-400" />
                              {dep.name}
                              {dep.is_critical && (
                                <span className="text-xs text-red-500">(critical)</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Used By */}
                    {system.dependencies.used_by.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Used by:</p>
                        <div className="space-y-1">
                          {system.dependencies.used_by.map((dep) => (
                            <div
                              key={dep.id}
                              className="text-sm text-gray-700 flex items-center gap-2"
                            >
                              <Server className="w-4 h-4 text-gray-400" />
                              {dep.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Metadata */}
              {system.metadata && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Details
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(system.metadata).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-gray-500">{key}:</span>{' '}
                        <span className="text-gray-900">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Footer */}
          <div className="px-6 py-4 border-t flex justify-end gap-3">
            <button
              onClick={closeSystemDetail}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              Close
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 flex items-center gap-2">
              View Full Details
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
```

---

## Main Page Component

File: `pages/LeaderDashboard/SystemArchitecture/index.tsx`

```typescript
import { FC } from 'react';
import { useArchitectureLayers } from '@/features/architecture-visualization/hooks/useArchitectureLayers';
import { useArchitectureStore } from '@/features/architecture-visualization/store/architectureStore';
import { LayerAccordion } from '@/features/architecture-visualization/components/AccordionView/LayerAccordion';
import { SystemDetailModal } from '@/features/architecture-visualization/components/SystemDetailModal';
import { ControlBar } from '@/features/architecture-visualization/components/ControlBar';
import { MetricsSummary } from '@/features/architecture-visualization/components/MetricsSummary';

export const SystemArchitecturePage: FC = () => {
  const { data: layers, isLoading, error } = useArchitectureLayers();
  const viewMode = useArchitectureStore((state) => state.viewMode);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading architecture...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">Error loading architecture</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Kiến trúc Hệ thống
          </h1>
          <p className="text-gray-600 mt-1">
            Tổng quan quy hoạch tổng thể 5 tầng
          </p>
        </div>

        {/* Control Bar */}
        <ControlBar />

        {/* Metrics Summary */}
        <MetricsSummary />

        {/* Main Content */}
        <div className="mt-6">
          {viewMode === 'accordion' ? (
            <div className="space-y-3">
              {layers?.map((layer) => (
                <LayerAccordion key={layer.id} layer={layer} />
              ))}
            </div>
          ) : (
            <div>Diagram View (Coming Soon)</div>
          )}
        </div>

        {/* System Detail Modal */}
        <SystemDetailModal />
      </div>
    </div>
  );
};
```

---

## Performance Optimizations

### 1. React.memo for expensive components
```typescript
export const SystemCard = memo(SystemCardComponent);
export const LayerAccordion = memo(LayerAccordionComponent);
```

### 2. Lazy Loading
```typescript
const DiagramView = lazy(() => import('./components/DiagramView'));
```

### 3. Virtual Scrolling (if many systems)
```typescript
import { FixedSizeList } from 'react-window';
```

### 4. Debounced Search
```typescript
const debouncedSearch = useDebounce(searchTerm, 300);
```

---

## Next Steps

1. ✅ Frontend architecture designed → This document
2. ⏭️ Implement components
3. ⏭️ Integrate with backend API
4. ⏭️ Add unit tests
5. ⏭️ Add E2E tests
6. ⏭️ Optimize performance
