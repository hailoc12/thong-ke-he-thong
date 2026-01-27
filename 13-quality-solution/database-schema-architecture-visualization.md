# Database Schema Design: Architecture Visualization

**Date**: 2026-01-24
**Purpose**: Complete database schema for system architecture visualization feature

---

## Schema Overview

```
architecture_layers (5 tầng: L1-L5)
    ↓ 1:N
architecture_components (khối/cụm trong mỗi tầng)
    ↓ 1:N
systems (các hệ thống)
    ↓ 1:N
system_dependencies (quan hệ giữa systems)
```

---

## Table: architecture_layers

Lưu thông tin 5 tầng kiến trúc.

```sql
CREATE TABLE architecture_layers (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,           -- 'L1', 'L2', 'L3', 'L4', 'L5'
  name_vi VARCHAR(255) NOT NULL,              -- 'Hạ tầng', 'Dữ liệu & AI'
  name_en VARCHAR(255),                       -- 'Infrastructure', 'Data & AI'
  description_vi TEXT,                        -- Mô tả chi tiết tiếng Việt
  description_en TEXT,                        -- Mô tả chi tiết tiếng Anh
  color_code VARCHAR(7) NOT NULL,             -- '#607D8B' (hex color)
  icon VARCHAR(50),                           -- Icon class: 'server', 'database'
  display_order INT NOT NULL,                 -- 1, 2, 3, 4, 5 (để sort)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT REFERENCES users(id),
  updated_by INT REFERENCES users(id)
);

CREATE INDEX idx_arch_layers_code ON architecture_layers(code);
CREATE INDEX idx_arch_layers_display_order ON architecture_layers(display_order);
```

### Sample Data
```sql
INSERT INTO architecture_layers (code, name_vi, name_en, description_vi, color_code, icon, display_order) VALUES
('L1', 'Hạ tầng', 'Infrastructure', 'Vật lý và ảo hóa', '#607D8B', 'server', 1),
('L2', 'Dữ liệu & AI/ML', 'Data & AI/ML', 'Dữ liệu lớn & Dữ liệu nhỏ - Trí tuệ nhân tạo & Máy học', '#9C27B0', 'database', 2),
('L3', 'Dịch vụ', 'Services', 'Các dịch vụ nghiệp vụ và core services', '#4CAF50', 'grid', 3),
('L4', 'Tích hợp & Trung gian liên thông', 'Integration & Mediator', 'API Gateway, Service Mesh, Integration', '#E91E63', 'share-2', 4),
('L5', 'Ứng dụng', 'Applications', 'Kênh truy cập và môi trường chạy ứng dụng', '#FF9800', 'layout', 5);
```

---

## Table: architecture_components

Lưu các khối/cụm thành phần trong mỗi tầng.

```sql
CREATE TABLE architecture_components (
  id SERIAL PRIMARY KEY,
  layer_id INT NOT NULL REFERENCES architecture_layers(id) ON DELETE CASCADE,
  parent_component_id INT REFERENCES architecture_components(id) ON DELETE SET NULL,
  code VARCHAR(100) NOT NULL,                 -- 'L3_CORE_SERVICES', 'L3_BUSINESS_ADMIN'
  name_vi VARCHAR(255) NOT NULL,              -- 'Khối dịch vụ cốt lõi'
  name_en VARCHAR(255),                       -- 'Core Services Block'
  description_vi TEXT,
  description_en TEXT,
  icon VARCHAR(50),                           -- Icon cho component
  color_code VARCHAR(7),                      -- Color override (optional)
  display_order INT NOT NULL,                 -- Thứ tự hiển thị trong tầng
  is_active BOOLEAN DEFAULT true,
  metadata JSONB,                             -- Flexible metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT REFERENCES users(id),
  updated_by INT REFERENCES users(id),

  CONSTRAINT unique_component_code UNIQUE(layer_id, code)
);

CREATE INDEX idx_arch_components_layer ON architecture_components(layer_id);
CREATE INDEX idx_arch_components_parent ON architecture_components(parent_component_id);
CREATE INDEX idx_arch_components_code ON architecture_components(code);
CREATE INDEX idx_arch_components_display_order ON architecture_components(layer_id, display_order);
```

### Sample Data - Tầng 1 (Infrastructure)
```sql
INSERT INTO architecture_components (layer_id, code, name_vi, name_en, display_order) VALUES
((SELECT id FROM architecture_layers WHERE code='L1'), 'L1_CI_CD', 'CI CD Pipeline', 'CI CD Pipeline', 1),
((SELECT id FROM architecture_layers WHERE code='L1'), 'L1_K8S', 'Kubernetes Cluster', 'Kubernetes Cluster', 2),
((SELECT id FROM architecture_layers WHERE code='L1'), 'L1_KMS', 'Secrets KMS HSM', 'Secrets KMS HSM', 3),
((SELECT id FROM architecture_layers WHERE code='L1'), 'L1_NETWORK', 'Network zero trust vpn', 'Network zero trust vpn', 4),
((SELECT id FROM architecture_layers WHERE code='L1'), 'L1_STORAGE', 'Object storage backup', 'Object storage backup', 5),
((SELECT id FROM architecture_layers WHERE code='L1'), 'L1_CLOUD', 'Government Cloud', 'Government Cloud', 6);
```

### Sample Data - Tầng 3 (Services) - Hierarchical
```sql
-- Parent: Khối dịch vụ cốt lõi
INSERT INTO architecture_components (layer_id, code, name_vi, display_order) VALUES
((SELECT id FROM architecture_layers WHERE code='L3'), 'L3_CORE', 'Khối dịch vụ cốt lõi (core)', 4);

-- Children: Các service cụ thể trong khối core
INSERT INTO architecture_components (layer_id, parent_component_id, code, name_vi, display_order) VALUES
((SELECT id FROM architecture_layers WHERE code='L3'),
 (SELECT id FROM architecture_components WHERE code='L3_CORE'),
 'L3_CORE_IDENTITY', 'MST Identity SSO', 1),
((SELECT id FROM architecture_layers WHERE code='L3'),
 (SELECT id FROM architecture_components WHERE code='L3_CORE'),
 'L3_CORE_AUTH', 'MST Authentication', 2),
((SELECT id FROM architecture_layers WHERE code='L3'),
 (SELECT id FROM architecture_components WHERE code='L3_CORE'),
 'L3_CORE_WORKFLOW', 'MST Workflow/Rules engine', 3);
-- ... more services
```

---

## Table: systems (Modified)

Add columns to link systems to architecture.

```sql
-- Migration to add new columns
ALTER TABLE systems ADD COLUMN IF NOT EXISTS architecture_layer_id INT REFERENCES architecture_layers(id) ON DELETE SET NULL;
ALTER TABLE systems ADD COLUMN IF NOT EXISTS architecture_component_id INT REFERENCES architecture_components(id) ON DELETE SET NULL;
ALTER TABLE systems ADD COLUMN IF NOT EXISTS deployment_status VARCHAR(50) DEFAULT 'planned';
ALTER TABLE systems ADD COLUMN IF NOT EXISTS health_status VARCHAR(50) DEFAULT 'unknown';
ALTER TABLE systems ADD COLUMN IF NOT EXISTS architecture_metadata JSONB;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_systems_arch_layer ON systems(architecture_layer_id);
CREATE INDEX IF NOT EXISTS idx_systems_arch_component ON systems(architecture_component_id);
CREATE INDEX IF NOT EXISTS idx_systems_deployment_status ON systems(deployment_status);
CREATE INDEX IF NOT EXISTS idx_systems_health_status ON systems(health_status);

-- Add constraints
ALTER TABLE systems ADD CONSTRAINT chk_deployment_status
  CHECK (deployment_status IN ('planned', 'in_development', 'testing', 'staging', 'production', 'deprecated'));

ALTER TABLE systems ADD CONSTRAINT chk_health_status
  CHECK (health_status IN ('unknown', 'healthy', 'degraded', 'down', 'maintenance'));
```

### Deployment Status Values
- `planned`: Đã quy hoạch, chưa bắt đầu phát triển
- `in_development`: Đang phát triển
- `testing`: Đang testing
- `staging`: Deploy ở môi trường staging
- `production`: Đang chạy production (🟢 Running)
- `deprecated`: Ngừng sử dụng

### Health Status Values
- `unknown`: Chưa có thông tin
- `healthy`: Hoạt động tốt (🟢)
- `degraded`: Có vấn đề nhỏ (🟡)
- `down`: Ngưng hoạt động (🔴)
- `maintenance`: Đang bảo trì (🔵)

---

## Table: system_dependencies

Lưu quan hệ dependencies giữa các systems.

```sql
CREATE TABLE system_dependencies (
  id SERIAL PRIMARY KEY,
  source_system_id INT NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
  target_system_id INT NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
  dependency_type VARCHAR(50) NOT NULL,       -- 'uses', 'provides_data_to', 'calls_api'
  is_critical BOOLEAN DEFAULT false,          -- Critical dependency?
  description TEXT,
  metadata JSONB,                             -- Flexible metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT REFERENCES users(id),

  CONSTRAINT unique_dependency UNIQUE(source_system_id, target_system_id, dependency_type),
  CONSTRAINT no_self_dependency CHECK (source_system_id != target_system_id)
);

CREATE INDEX idx_system_deps_source ON system_dependencies(source_system_id);
CREATE INDEX idx_system_deps_target ON system_dependencies(target_system_id);
CREATE INDEX idx_system_deps_type ON system_dependencies(dependency_type);
```

### Dependency Types
- `uses`: System A uses System B
- `provides_data_to`: System A provides data to System B
- `calls_api`: System A calls API of System B
- `authenticates_via`: System A authenticates via System B
- `integrates_with`: System A integrates with System B

### Sample Data
```sql
-- MST UGP Portal uses MST API Gateway
INSERT INTO system_dependencies (source_system_id, target_system_id, dependency_type, is_critical) VALUES
((SELECT id FROM systems WHERE name='MST UGP Portal'),
 (SELECT id FROM systems WHERE name='MST API Gateway'),
 'calls_api', true);

-- MST API Gateway uses MST Service Registry
INSERT INTO system_dependencies (source_system_id, target_system_id, dependency_type, is_critical) VALUES
((SELECT id FROM systems WHERE name='MST API Gateway'),
 (SELECT id FROM systems WHERE name='MST Service Registry'),
 'uses', true);
```

---

## Table: architecture_metrics (Optional)

Lưu metrics theo thời gian cho analytics.

```sql
CREATE TABLE architecture_metrics (
  id SERIAL PRIMARY KEY,
  layer_id INT REFERENCES architecture_layers(id),
  component_id INT REFERENCES architecture_components(id),
  metric_type VARCHAR(50) NOT NULL,           -- 'completion_rate', 'system_count', 'uptime'
  metric_value DECIMAL(10,2) NOT NULL,
  metric_unit VARCHAR(20),                    -- '%', 'count', 'ms'
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);

CREATE INDEX idx_arch_metrics_layer ON architecture_metrics(layer_id, recorded_at);
CREATE INDEX idx_arch_metrics_component ON architecture_metrics(component_id, recorded_at);
CREATE INDEX idx_arch_metrics_type ON architecture_metrics(metric_type, recorded_at);
```

### Metric Types
- `completion_rate`: Tỷ lệ hoàn thành (%)
- `system_count`: Số lượng systems
- `avg_uptime`: Uptime trung bình (%)
- `error_rate`: Tỷ lệ lỗi (%)

---

## Complete Migration Script

```sql
-- ============================================
-- Migration: Add Architecture Visualization
-- Date: 2026-01-24
-- ============================================

BEGIN;

-- 1. Create architecture_layers table
CREATE TABLE IF NOT EXISTS architecture_layers (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name_vi VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  description_vi TEXT,
  description_en TEXT,
  color_code VARCHAR(7) NOT NULL,
  icon VARCHAR(50),
  display_order INT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT REFERENCES users(id),
  updated_by INT REFERENCES users(id)
);

CREATE INDEX idx_arch_layers_code ON architecture_layers(code);
CREATE INDEX idx_arch_layers_display_order ON architecture_layers(display_order);

-- 2. Create architecture_components table
CREATE TABLE IF NOT EXISTS architecture_components (
  id SERIAL PRIMARY KEY,
  layer_id INT NOT NULL REFERENCES architecture_layers(id) ON DELETE CASCADE,
  parent_component_id INT REFERENCES architecture_components(id) ON DELETE SET NULL,
  code VARCHAR(100) NOT NULL,
  name_vi VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  description_vi TEXT,
  description_en TEXT,
  icon VARCHAR(50),
  color_code VARCHAR(7),
  display_order INT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT REFERENCES users(id),
  updated_by INT REFERENCES users(id),

  CONSTRAINT unique_component_code UNIQUE(layer_id, code)
);

CREATE INDEX idx_arch_components_layer ON architecture_components(layer_id);
CREATE INDEX idx_arch_components_parent ON architecture_components(parent_component_id);
CREATE INDEX idx_arch_components_code ON architecture_components(code);
CREATE INDEX idx_arch_components_display_order ON architecture_components(layer_id, display_order);

-- 3. Modify systems table
ALTER TABLE systems ADD COLUMN IF NOT EXISTS architecture_layer_id INT REFERENCES architecture_layers(id) ON DELETE SET NULL;
ALTER TABLE systems ADD COLUMN IF NOT EXISTS architecture_component_id INT REFERENCES architecture_components(id) ON DELETE SET NULL;
ALTER TABLE systems ADD COLUMN IF NOT EXISTS deployment_status VARCHAR(50) DEFAULT 'planned';
ALTER TABLE systems ADD COLUMN IF NOT EXISTS health_status VARCHAR(50) DEFAULT 'unknown';
ALTER TABLE systems ADD COLUMN IF NOT EXISTS architecture_metadata JSONB;

CREATE INDEX IF NOT EXISTS idx_systems_arch_layer ON systems(architecture_layer_id);
CREATE INDEX IF NOT EXISTS idx_systems_arch_component ON systems(architecture_component_id);
CREATE INDEX IF NOT EXISTS idx_systems_deployment_status ON systems(deployment_status);
CREATE INDEX IF NOT EXISTS idx_systems_health_status ON systems(health_status);

ALTER TABLE systems ADD CONSTRAINT chk_deployment_status
  CHECK (deployment_status IN ('planned', 'in_development', 'testing', 'staging', 'production', 'deprecated'));

ALTER TABLE systems ADD CONSTRAINT chk_health_status
  CHECK (health_status IN ('unknown', 'healthy', 'degraded', 'down', 'maintenance'));

-- 4. Create system_dependencies table
CREATE TABLE IF NOT EXISTS system_dependencies (
  id SERIAL PRIMARY KEY,
  source_system_id INT NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
  target_system_id INT NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
  dependency_type VARCHAR(50) NOT NULL,
  is_critical BOOLEAN DEFAULT false,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT REFERENCES users(id),

  CONSTRAINT unique_dependency UNIQUE(source_system_id, target_system_id, dependency_type),
  CONSTRAINT no_self_dependency CHECK (source_system_id != target_system_id)
);

CREATE INDEX idx_system_deps_source ON system_dependencies(source_system_id);
CREATE INDEX idx_system_deps_target ON system_dependencies(target_system_id);
CREATE INDEX idx_system_deps_type ON system_dependencies(dependency_type);

-- 5. Create architecture_metrics table (optional)
CREATE TABLE IF NOT EXISTS architecture_metrics (
  id SERIAL PRIMARY KEY,
  layer_id INT REFERENCES architecture_layers(id),
  component_id INT REFERENCES architecture_components(id),
  metric_type VARCHAR(50) NOT NULL,
  metric_value DECIMAL(10,2) NOT NULL,
  metric_unit VARCHAR(20),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);

CREATE INDEX idx_arch_metrics_layer ON architecture_metrics(layer_id, recorded_at);
CREATE INDEX idx_arch_metrics_component ON architecture_metrics(component_id, recorded_at);
CREATE INDEX idx_arch_metrics_type ON architecture_metrics(metric_type, recorded_at);

COMMIT;
```

---

## Seed Data Script

Create file: `seed-architecture-data.sql`

```sql
-- ============================================
-- Seed Data: Architecture Visualization
-- Date: 2026-01-24
-- ============================================

BEGIN;

-- 1. Insert Layers
INSERT INTO architecture_layers (code, name_vi, name_en, description_vi, color_code, icon, display_order) VALUES
('L1', 'Hạ tầng', 'Infrastructure', 'Vật lý và ảo hóa', '#607D8B', 'server', 1),
('L2', 'Dữ liệu & AI/ML', 'Data & AI/ML', 'Dữ liệu lớn & Dữ liệu nhỏ - Trí tuệ nhân tạo & Máy học', '#9C27B0', 'database', 2),
('L3', 'Dịch vụ', 'Services', 'Các dịch vụ nghiệp vụ và core services', '#4CAF50', 'grid', 3),
('L4', 'Tích hợp & Trung gian liên thông', 'Integration & Mediator', 'API Gateway, Service Mesh, Integration', '#E91E63', 'share-2', 4),
('L5', 'Ứng dụng', 'Applications', 'Kênh truy cập và môi trường chạy ứng dụng', '#FF9800', 'layout', 5)
ON CONFLICT (code) DO NOTHING;

-- 2. Insert Components for Layer 1 (Infrastructure)
INSERT INTO architecture_components (layer_id, code, name_vi, name_en, display_order) VALUES
((SELECT id FROM architecture_layers WHERE code='L1'), 'L1_CI_CD', 'CI CD Pipeline', 'CI CD Pipeline', 1),
((SELECT id FROM architecture_layers WHERE code='L1'), 'L1_K8S', 'Kubernetes Cluster', 'Kubernetes Cluster', 2),
((SELECT id FROM architecture_layers WHERE code='L1'), 'L1_KMS', 'Secrets KMS HSM', 'Secrets KMS HSM', 3),
((SELECT id FROM architecture_layers WHERE code='L1'), 'L1_NETWORK', 'Network zero trust vpn', 'Network zero trust vpn', 4),
((SELECT id FROM architecture_layers WHERE code='L1'), 'L1_STORAGE', 'Object storage backup', 'Object storage backup', 5),
((SELECT id FROM architecture_layers WHERE code='L1'), 'L1_CLOUD', 'Government Cloud', 'Government Cloud', 6)
ON CONFLICT (layer_id, code) DO NOTHING;

-- 3. Insert Components for Layer 2 (Data & AI)
-- L2.1 - Cơ sở dữ liệu vận hành của Bộ MST
INSERT INTO architecture_components (layer_id, code, name_vi, display_order) VALUES
((SELECT id FROM architecture_layers WHERE code='L2'), 'L2_1', 'L2.1 - Cơ sở dữ liệu vận hành của Bộ MST', 1)
ON CONFLICT (layer_id, code) DO NOTHING;

-- L2.2 - Cơ sở dữ liệu vận hành của Cục
INSERT INTO architecture_components (layer_id, code, name_vi, display_order) VALUES
((SELECT id FROM architecture_layers WHERE code='L2'), 'L2_2', 'L2.2 - Cơ sở dữ liệu vận hành của Cục', 2)
ON CONFLICT (layer_id, code) DO NOTHING;

-- L2.1a - Data lakehouse
INSERT INTO architecture_components (layer_id, code, name_vi, display_order) VALUES
((SELECT id FROM architecture_layers WHERE code='L2'), 'L2_1A', 'L2.1a - Data lakehouse (hệ dữ liệu lớn)', 4)
ON CONFLICT (layer_id, code) DO NOTHING;

-- Children of L2.1a
INSERT INTO architecture_components (layer_id, parent_component_id, code, name_vi, display_order) VALUES
((SELECT id FROM architecture_layers WHERE code='L2'), (SELECT id FROM architecture_components WHERE code='L2_1A'), 'L2_1A_EVENT_BUS', 'MST Event bus & CDC hub', 1),
((SELECT id FROM architecture_layers WHERE code='L2'), (SELECT id FROM architecture_components WHERE code='L2_1A'), 'L2_1A_CATALOG', 'Data catalog/ Metadata', 2),
((SELECT id FROM architecture_layers WHERE code='L2'), (SELECT id FROM architecture_components WHERE code='L2_1A'), 'L2_1A_LAKEHOUSE', 'MST Data Lakehouse', 3),
((SELECT id FROM architecture_layers WHERE code='L2'), (SELECT id FROM architecture_components WHERE code='L2_1A'), 'L2_1A_BI', 'MST BI analytics engine', 4)
ON CONFLICT (layer_id, code) DO NOTHING;

-- 4. Insert Components for Layer 3 (Services)
-- Khối quản trị, điều hành
INSERT INTO architecture_components (layer_id, code, name_vi, display_order) VALUES
((SELECT id FROM architecture_layers WHERE code='L3'), 'L3_ADMIN', 'Khối dịch vụ/ ứng dụng quản trị, điều hành', 1)
ON CONFLICT (layer_id, code) DO NOTHING;

-- Khối core services
INSERT INTO architecture_components (layer_id, code, name_vi, display_order) VALUES
((SELECT id FROM architecture_layers WHERE code='L3'), 'L3_CORE', 'Khối dịch vụ cốt lõi (core)', 4)
ON CONFLICT (layer_id, code) DO NOTHING;

-- Children of L3_CORE
INSERT INTO architecture_components (layer_id, parent_component_id, code, name_vi, display_order) VALUES
((SELECT id FROM architecture_layers WHERE code='L3'), (SELECT id FROM architecture_components WHERE code='L3_CORE'), 'L3_CORE_IDENTITY', 'MST Identity SSO', 1),
((SELECT id FROM architecture_layers WHERE code='L3'), (SELECT id FROM architecture_components WHERE code='L3_CORE'), 'L3_CORE_AUTH', 'MST Authentication', 2),
((SELECT id FROM architecture_layers WHERE code='L3'), (SELECT id FROM architecture_components WHERE code='L3_CORE'), 'L3_CORE_WORKFLOW', 'MST Workflow/Rules engine', 3),
((SELECT id FROM architecture_layers WHERE code='L3'), (SELECT id FROM architecture_components WHERE code='L3_CORE'), 'L3_CORE_WORKSPACE', 'MST Workspace', 4),
((SELECT id FROM architecture_layers WHERE code='L3'), (SELECT id FROM architecture_components WHERE code='L3_CORE'), 'L3_CORE_DRIVE', 'MST Drive/ Search', 5),
((SELECT id FROM architecture_layers WHERE code='L3'), (SELECT id FROM architecture_components WHERE code='L3_CORE'), 'L3_CORE_OBSERVABILITY', 'MST Observability', 6),
((SELECT id FROM architecture_layers WHERE code='L3'), (SELECT id FROM architecture_components WHERE code='L3_CORE'), 'L3_CORE_NOTIFICATION', 'MST NotificationHub', 7),
((SELECT id FROM architecture_layers WHERE code='L3'), (SELECT id FROM architecture_components WHERE code='L3_CORE'), 'L3_CORE_SECURITY', 'MST Cyber Security', 8),
((SELECT id FROM architecture_layers WHERE code='L3'), (SELECT id FROM architecture_components WHERE code='L3_CORE'), 'L3_CORE_ESIGNATURE', 'MST eSignature', 9),
((SELECT id FROM architecture_layers WHERE code='L3'), (SELECT id FROM architecture_components WHERE code='L3_CORE'), 'L3_CORE_BI', 'MST BI &AI toàn bộ Bộ', 10)
ON CONFLICT (layer_id, code) DO NOTHING;

-- 5. Insert Components for Layer 4 (Integration)
INSERT INTO architecture_components (layer_id, code, name_vi, display_order) VALUES
((SELECT id FROM architecture_layers WHERE code='L4'), 'L4_1', 'L4.1 - Tích hợp của Bộ MST', 1),
((SELECT id FROM architecture_layers WHERE code='L4'), 'L4_2', 'L4.2 - Tích hợp với bên ngoài', 2)
ON CONFLICT (layer_id, code) DO NOTHING;

-- Children of L4.1
INSERT INTO architecture_components (layer_id, parent_component_id, code, name_vi, display_order) VALUES
((SELECT id FROM architecture_layers WHERE code='L4'), (SELECT id FROM architecture_components WHERE code='L4_1'), 'L4_1_REGISTRY', 'MST Service Registry', 1),
((SELECT id FROM architecture_layers WHERE code='L4'), (SELECT id FROM architecture_components WHERE code='L4_1'), 'L4_1_MESH', 'MST Service Mesh', 2),
((SELECT id FROM architecture_layers WHERE code='L4'), (SELECT id FROM architecture_components WHERE code='L4_1'), 'L4_1_GATEWAY', 'MST API Gateway', 3),
((SELECT id FROM architecture_layers WHERE code='L4'), (SELECT id FROM architecture_components WHERE code='L4_1'), 'L4_1_MEDIATOR', 'Information Mediator', 4)
ON CONFLICT (layer_id, code) DO NOTHING;

-- 6. Insert Components for Layer 5 (Applications)
INSERT INTO architecture_components (layer_id, code, name_vi, display_order) VALUES
((SELECT id FROM architecture_layers WHERE code='L5'), 'L5_1', 'L5.1 - Kênh truy cập và môi trường chạy ứng dụng của Bộ', 1),
((SELECT id FROM architecture_layers WHERE code='L5'), 'L5_2', 'L5.2 - Kênh ứng dụng riêng các đơn vị', 2)
ON CONFLICT (layer_id, code) DO NOTHING;

-- Children of L5.1
INSERT INTO architecture_components (layer_id, parent_component_id, code, name_vi, display_order) VALUES
((SELECT id FROM architecture_layers WHERE code='L5'), (SELECT id FROM architecture_components WHERE code='L5_1'), 'L5_1_PORTAL', 'MST UGP Portal', 1),
((SELECT id FROM architecture_layers WHERE code='L5'), (SELECT id FROM architecture_components WHERE code='L5_1'), 'L5_1_LEADER', 'MST Leader Dashboard', 2),
((SELECT id FROM architecture_layers WHERE code='L5'), (SELECT id FROM architecture_components WHERE code='L5_1'), 'L5_1_OFFICER', 'MST Officer Workspace', 3),
((SELECT id FROM architecture_layers WHERE code='L5'), (SELECT id FROM architecture_components WHERE code='L5_1'), 'L5_1_MOBILE', 'MST UGP Mobile', 4),
((SELECT id FROM architecture_layers WHERE code='L5'), (SELECT id FROM architecture_components WHERE code='L5_1'), 'L5_1_DEV_PORTAL', 'MST Dev Portal', 5),
((SELECT id FROM architecture_layers WHERE code='L5'), (SELECT id FROM architecture_components WHERE code='L5_1'), 'L5_1_BFF', 'Backend For Frontend', 6)
ON CONFLICT (layer_id, code) DO NOTHING;

COMMIT;
```

---

## Helper Views

Create useful views for querying.

```sql
-- View: Tổng hợp systems theo layer
CREATE OR REPLACE VIEW v_systems_by_layer AS
SELECT
  l.id as layer_id,
  l.code as layer_code,
  l.name_vi as layer_name,
  COUNT(s.id) as system_count,
  COUNT(CASE WHEN s.deployment_status = 'production' THEN 1 END) as production_count,
  COUNT(CASE WHEN s.health_status = 'healthy' THEN 1 END) as healthy_count,
  ROUND(100.0 * COUNT(CASE WHEN s.deployment_status = 'production' THEN 1 END) / NULLIF(COUNT(s.id), 0), 2) as completion_rate
FROM architecture_layers l
LEFT JOIN systems s ON s.architecture_layer_id = l.id
GROUP BY l.id, l.code, l.name_vi
ORDER BY l.display_order;

-- View: Tổng hợp systems theo component
CREATE OR REPLACE VIEW v_systems_by_component AS
SELECT
  c.id as component_id,
  c.code as component_code,
  c.name_vi as component_name,
  l.code as layer_code,
  l.name_vi as layer_name,
  COUNT(s.id) as system_count,
  COUNT(CASE WHEN s.deployment_status = 'production' THEN 1 END) as production_count
FROM architecture_components c
LEFT JOIN architecture_layers l ON c.layer_id = l.id
LEFT JOIN systems s ON s.architecture_component_id = c.id
GROUP BY c.id, c.code, c.name_vi, l.code, l.name_vi
ORDER BY l.display_order, c.display_order;

-- View: System with full architecture info
CREATE OR REPLACE VIEW v_systems_with_architecture AS
SELECT
  s.*,
  l.code as layer_code,
  l.name_vi as layer_name,
  c.code as component_code,
  c.name_vi as component_name
FROM systems s
LEFT JOIN architecture_layers l ON s.architecture_layer_id = l.id
LEFT JOIN architecture_components c ON s.architecture_component_id = c.id;
```

---

## Data Migration Plan

### Step 1: Backup
```bash
pg_dump -U postgres -d your_database > backup_before_arch_migration.sql
```

### Step 2: Run Migration
```bash
psql -U postgres -d your_database -f migration-architecture.sql
```

### Step 3: Seed Data
```bash
psql -U postgres -d your_database -f seed-architecture-data.sql
```

### Step 4: Map Existing Systems
```sql
-- Example: Map existing systems to architecture
UPDATE systems
SET architecture_layer_id = (SELECT id FROM architecture_layers WHERE code='L5'),
    architecture_component_id = (SELECT id FROM architecture_components WHERE code='L5_1_LEADER'),
    deployment_status = 'production',
    health_status = 'healthy'
WHERE name = 'MST Leader Dashboard';

UPDATE systems
SET architecture_layer_id = (SELECT id FROM architecture_layers WHERE code='L4'),
    architecture_component_id = (SELECT id FROM architecture_components WHERE code='L4_1_GATEWAY'),
    deployment_status = 'production',
    health_status = 'healthy'
WHERE name = 'MST API Gateway';

-- ... map more systems
```

### Step 5: Verify
```sql
-- Check layer summary
SELECT * FROM v_systems_by_layer;

-- Check unmapped systems
SELECT id, name FROM systems WHERE architecture_layer_id IS NULL;
```

---

## Next Steps

1. ✅ Database schema designed → This document
2. ⏭️ Create migration SQL file
3. ⏭️ Create seed data SQL file
4. ⏭️ Design API endpoints
5. ⏭️ Frontend implementation
