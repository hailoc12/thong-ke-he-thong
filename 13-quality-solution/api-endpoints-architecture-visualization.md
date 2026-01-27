# API Endpoints Specification: Architecture Visualization

**Date**: 2026-01-24
**Purpose**: Complete REST API specification for architecture visualization feature
**Base URL**: `/api/v1`

---

## Authentication

All endpoints require JWT authentication.

```http
Authorization: Bearer <jwt_token>
```

**User Type Required**: `lanh_dao_bo` (Lãnh đạo Bộ)

---

## Endpoint List

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/architecture/layers` | Get all layers with summary |
| GET | `/architecture/layers/:id` | Get layer detail |
| GET | `/architecture/components` | Get components (with filters) |
| GET | `/architecture/components/:id` | Get component detail |
| GET | `/architecture/systems` | Get systems by architecture |
| GET | `/architecture/systems/:id` | Get system detail with dependencies |
| GET | `/architecture/metrics` | Get architecture metrics |
| GET | `/architecture/summary` | Get overall summary |

---

## 1. GET `/architecture/layers`

Get all architecture layers with system count and completion rate.

### Request
```http
GET /api/v1/architecture/layers
Authorization: Bearer <token>
```

### Query Parameters
None

### Response `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "L1",
      "name_vi": "Hạ tầng",
      "name_en": "Infrastructure",
      "description_vi": "Vật lý và ảo hóa",
      "color_code": "#607D8B",
      "icon": "server",
      "display_order": 1,
      "metrics": {
        "total_systems": 6,
        "production_systems": 6,
        "healthy_systems": 6,
        "completion_rate": 100.0
      }
    },
    {
      "id": 2,
      "code": "L2",
      "name_vi": "Dữ liệu & AI/ML",
      "name_en": "Data & AI/ML",
      "description_vi": "Dữ liệu lớn & Dữ liệu nhỏ - Trí tuệ nhân tạo & Máy học",
      "color_code": "#9C27B0",
      "icon": "database",
      "display_order": 2,
      "metrics": {
        "total_systems": 18,
        "production_systems": 15,
        "healthy_systems": 14,
        "completion_rate": 83.33
      }
    },
    {
      "id": 3,
      "code": "L3",
      "name_vi": "Dịch vụ",
      "name_en": "Services",
      "description_vi": "Các dịch vụ nghiệp vụ và core services",
      "color_code": "#4CAF50",
      "icon": "grid",
      "display_order": 3,
      "metrics": {
        "total_systems": 45,
        "production_systems": 32,
        "healthy_systems": 30,
        "completion_rate": 71.11
      }
    },
    {
      "id": 4,
      "code": "L4",
      "name_vi": "Tích hợp & Trung gian liên thông",
      "color_code": "#E91E63",
      "icon": "share-2",
      "display_order": 4,
      "metrics": {
        "total_systems": 4,
        "production_systems": 4,
        "healthy_systems": 4,
        "completion_rate": 100.0
      }
    },
    {
      "id": 5,
      "code": "L5",
      "name_vi": "Ứng dụng",
      "color_code": "#FF9800",
      "icon": "layout",
      "display_order": 5,
      "metrics": {
        "total_systems": 28,
        "production_systems": 24,
        "healthy_systems": 22,
        "completion_rate": 85.71
      }
    }
  ],
  "meta": {
    "total_layers": 5,
    "timestamp": "2026-01-24T14:30:00Z"
  }
}
```

### Error Responses
```json
// 401 Unauthorized
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}

// 403 Forbidden
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "User type 'lanh_dao_bo' required"
  }
}
```

---

## 2. GET `/architecture/components`

Get architecture components, optionally filtered by layer.

### Request
```http
GET /api/v1/architecture/components?layer_id=3&include_systems=true
Authorization: Bearer <token>
```

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `layer_id` | integer | No | Filter by layer ID |
| `include_systems` | boolean | No | Include system count (default: true) |
| `include_children` | boolean | No | Include nested children (default: false) |

### Response `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 15,
      "code": "L3_ADMIN",
      "name_vi": "Khối dịch vụ/ ứng dụng quản trị, điều hành",
      "name_en": "Business Administration Block",
      "description_vi": null,
      "icon": null,
      "color_code": null,
      "layer": {
        "id": 3,
        "code": "L3",
        "name_vi": "Dịch vụ",
        "color_code": "#4CAF50"
      },
      "parent_component_id": null,
      "display_order": 1,
      "metrics": {
        "total_systems": 8,
        "production_systems": 6,
        "in_development_systems": 2
      },
      "children": []
    },
    {
      "id": 18,
      "code": "L3_CORE",
      "name_vi": "Khối dịch vụ cốt lõi (core)",
      "name_en": "Core Services Block",
      "layer": {
        "id": 3,
        "code": "L3",
        "name_vi": "Dịch vụ",
        "color_code": "#4CAF50"
      },
      "parent_component_id": null,
      "display_order": 4,
      "metrics": {
        "total_systems": 10,
        "production_systems": 9,
        "in_development_systems": 1
      },
      "children": [
        {
          "id": 19,
          "code": "L3_CORE_IDENTITY",
          "name_vi": "MST Identity SSO",
          "parent_component_id": 18,
          "display_order": 1,
          "metrics": {
            "total_systems": 1,
            "production_systems": 1
          }
        },
        {
          "id": 20,
          "code": "L3_CORE_AUTH",
          "name_vi": "MST Authentication",
          "parent_component_id": 18,
          "display_order": 2,
          "metrics": {
            "total_systems": 1,
            "production_systems": 1
          }
        }
        // ... more children
      ]
    }
  ],
  "meta": {
    "total_components": 25,
    "filtered_by_layer": "L3",
    "timestamp": "2026-01-24T14:30:00Z"
  }
}
```

---

## 3. GET `/architecture/systems`

Get systems filtered by architecture layer/component.

### Request
```http
GET /api/v1/architecture/systems?component_id=19&deployment_status=production
Authorization: Bearer <token>
```

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `layer_id` | integer | No | Filter by layer |
| `component_id` | integer | No | Filter by component |
| `deployment_status` | string | No | Filter by status (planned, production, etc) |
| `health_status` | string | No | Filter by health (healthy, degraded, down) |
| `search` | string | No | Search by name |
| `page` | integer | No | Page number (default: 1) |
| `limit` | integer | No | Items per page (default: 20, max: 100) |

### Response `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "name": "MST Identity SSO",
      "code": "MST_IDENTITY_SSO",
      "organization_name": "Bộ KH&CN",
      "department_name": "Vụ Công nghệ thông tin",
      "deployment_status": "production",
      "health_status": "healthy",
      "architecture": {
        "layer": {
          "id": 3,
          "code": "L3",
          "name_vi": "Dịch vụ"
        },
        "component": {
          "id": 19,
          "code": "L3_CORE_IDENTITY",
          "name_vi": "MST Identity SSO"
        }
      },
      "metadata": {
        "version": "v2.1.5",
        "uptime": "99.8%",
        "last_deployment": "2026-01-15T10:00:00Z"
      },
      "created_at": "2025-06-01T00:00:00Z",
      "updated_at": "2026-01-20T08:30:00Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "total_pages": 1
  }
}
```

---

## 4. GET `/architecture/systems/:id`

Get system detail with dependencies and relationships.

### Request
```http
GET /api/v1/architecture/systems/123
Authorization: Bearer <token>
```

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 123,
    "name": "MST Identity SSO",
    "code": "MST_IDENTITY_SSO",
    "description": "Single Sign-On service for all MST systems",
    "organization_name": "Bộ KH&CN",
    "department_name": "Vụ Công nghệ thông tin",
    "deployment_status": "production",
    "health_status": "healthy",

    "architecture": {
      "layer": {
        "id": 3,
        "code": "L3",
        "name_vi": "Dịch vụ",
        "color_code": "#4CAF50"
      },
      "component": {
        "id": 19,
        "code": "L3_CORE_IDENTITY",
        "name_vi": "MST Identity SSO",
        "parent": {
          "id": 18,
          "code": "L3_CORE",
          "name_vi": "Khối dịch vụ cốt lõi (core)"
        }
      }
    },

    "dependencies": {
      "uses": [
        {
          "id": 145,
          "name": "MST API Gateway",
          "code": "MST_API_GATEWAY",
          "dependency_type": "calls_api",
          "is_critical": true
        },
        {
          "id": 150,
          "name": "MST Service Registry",
          "code": "MST_SERVICE_REGISTRY",
          "dependency_type": "uses",
          "is_critical": true
        }
      ],
      "used_by": [
        {
          "id": 201,
          "name": "MST UGP Portal",
          "code": "MST_UGP_PORTAL",
          "dependency_type": "authenticates_via",
          "is_critical": true
        },
        {
          "id": 202,
          "name": "MST Officer Workspace",
          "code": "MST_OFFICER_WORKSPACE",
          "dependency_type": "authenticates_via",
          "is_critical": true
        }
      ]
    },

    "metadata": {
      "version": "v2.1.5",
      "uptime": "99.8%",
      "last_deployment": "2026-01-15T10:00:00Z",
      "environment": "production",
      "url": "https://sso.most.gov.vn"
    },

    "created_at": "2025-06-01T00:00:00Z",
    "updated_at": "2026-01-20T08:30:00Z",
    "created_by": {
      "id": 1,
      "full_name": "Admin User"
    }
  }
}
```

### Error Responses
```json
// 404 Not Found
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "System with ID 123 not found"
  }
}
```

---

## 5. GET `/architecture/metrics`

Get architecture-wide metrics and statistics.

### Request
```http
GET /api/v1/architecture/metrics?period=7d
Authorization: Bearer <token>
```

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `period` | string | No | Time period: 1d, 7d, 30d, 90d (default: 7d) |
| `layer_id` | integer | No | Filter by specific layer |

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "overall": {
      "total_systems": 101,
      "production_systems": 81,
      "in_development_systems": 15,
      "planned_systems": 5,
      "completion_rate": 80.2,
      "healthy_systems": 75,
      "degraded_systems": 4,
      "down_systems": 2,
      "health_rate": 92.6
    },

    "by_layer": [
      {
        "layer_id": 1,
        "layer_code": "L1",
        "layer_name": "Hạ tầng",
        "total_systems": 6,
        "production_systems": 6,
        "completion_rate": 100.0,
        "health_rate": 100.0
      },
      {
        "layer_id": 2,
        "layer_code": "L2",
        "layer_name": "Dữ liệu & AI/ML",
        "total_systems": 18,
        "production_systems": 15,
        "completion_rate": 83.33,
        "health_rate": 93.33
      },
      {
        "layer_id": 3,
        "layer_code": "L3",
        "layer_name": "Dịch vụ",
        "total_systems": 45,
        "production_systems": 32,
        "completion_rate": 71.11,
        "health_rate": 93.75
      },
      {
        "layer_id": 4,
        "layer_code": "L4",
        "layer_name": "Tích hợp & Trung gian liên thông",
        "total_systems": 4,
        "production_systems": 4,
        "completion_rate": 100.0,
        "health_rate": 100.0
      },
      {
        "layer_id": 5,
        "layer_code": "L5",
        "layer_name": "Ứng dụng",
        "total_systems": 28,
        "production_systems": 24,
        "completion_rate": 85.71,
        "health_rate": 91.67
      }
    ],

    "trends": {
      "period": "7d",
      "completion_rate_change": "+2.3%",
      "health_rate_change": "-0.5%",
      "new_systems_added": 3,
      "systems_moved_to_production": 2
    }
  },
  "meta": {
    "period": "7d",
    "timestamp": "2026-01-24T14:30:00Z"
  }
}
```

---

## 6. GET `/architecture/summary`

Get high-level summary for dashboard overview.

### Request
```http
GET /api/v1/architecture/summary
Authorization: Bearer <token>
```

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_layers": 5,
      "total_components": 50,
      "total_systems": 101,
      "production_systems": 81,
      "overall_completion": 80.2,
      "overall_health": 92.6
    },

    "highlights": [
      {
        "layer_code": "L1",
        "layer_name": "Hạ tầng",
        "status": "excellent",
        "completion_rate": 100.0,
        "message": "Hạ tầng hoàn chỉnh và ổn định"
      },
      {
        "layer_code": "L3",
        "layer_name": "Dịch vụ",
        "status": "in_progress",
        "completion_rate": 71.11,
        "message": "13 services còn đang phát triển"
      }
    ],

    "recent_changes": [
      {
        "system_name": "MST Workflow",
        "event": "deployed_to_production",
        "timestamp": "2026-01-22T10:00:00Z"
      },
      {
        "system_name": "MST BI Analytics",
        "event": "health_degraded",
        "timestamp": "2026-01-23T15:30:00Z"
      }
    ],

    "alerts": [
      {
        "severity": "warning",
        "message": "2 systems are currently down",
        "systems": ["MST Notification Hub", "Data Lakehouse Connector"]
      }
    ]
  },
  "meta": {
    "last_updated": "2026-01-24T14:30:00Z"
  }
}
```

---

## Backend Implementation (FastAPI)

### File Structure
```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       └── endpoints/
│   │           └── architecture.py        # All architecture endpoints
│   ├── models/
│   │   ├── architecture_layer.py
│   │   ├── architecture_component.py
│   │   └── system_dependency.py
│   ├── schemas/
│   │   └── architecture.py                # Pydantic schemas
│   ├── services/
│   │   └── architecture_service.py        # Business logic
│   └── dependencies.py                    # Auth dependencies
```

### Sample Implementation: `architecture.py`

```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.dependencies import get_db, require_user_type
from app.schemas.architecture import (
    ArchitectureLayerResponse,
    ArchitectureComponentResponse,
    ArchitectureSystemResponse,
    ArchitectureMetricsResponse,
    ArchitectureSummaryResponse
)
from app.services import architecture_service

router = APIRouter(prefix="/architecture", tags=["architecture"])

@router.get("/layers", response_model=List[ArchitectureLayerResponse])
async def get_architecture_layers(
    db: Session = Depends(get_db),
    current_user = Depends(require_user_type("lanh_dao_bo"))
):
    """
    Get all architecture layers with system counts and metrics.
    """
    layers = architecture_service.get_layers_with_metrics(db)
    return {
        "success": True,
        "data": layers,
        "meta": {
            "total_layers": len(layers),
            "timestamp": datetime.utcnow()
        }
    }

@router.get("/components", response_model=List[ArchitectureComponentResponse])
async def get_architecture_components(
    layer_id: Optional[int] = Query(None),
    include_systems: bool = Query(True),
    include_children: bool = Query(False),
    db: Session = Depends(get_db),
    current_user = Depends(require_user_type("lanh_dao_bo"))
):
    """
    Get architecture components with optional filters.
    """
    components = architecture_service.get_components(
        db,
        layer_id=layer_id,
        include_systems=include_systems,
        include_children=include_children
    )
    return {
        "success": True,
        "data": components,
        "meta": {
            "total_components": len(components),
            "filtered_by_layer": layer_id,
            "timestamp": datetime.utcnow()
        }
    }

@router.get("/systems", response_model=List[ArchitectureSystemResponse])
async def get_architecture_systems(
    layer_id: Optional[int] = Query(None),
    component_id: Optional[int] = Query(None),
    deployment_status: Optional[str] = Query(None),
    health_status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user = Depends(require_user_type("lanh_dao_bo"))
):
    """
    Get systems filtered by architecture parameters.
    """
    systems, total = architecture_service.get_systems(
        db,
        layer_id=layer_id,
        component_id=component_id,
        deployment_status=deployment_status,
        health_status=health_status,
        search=search,
        page=page,
        limit=limit
    )
    return {
        "success": True,
        "data": systems,
        "meta": {
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit
        }
    }

@router.get("/systems/{system_id}", response_model=ArchitectureSystemResponse)
async def get_system_detail(
    system_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_user_type("lanh_dao_bo"))
):
    """
    Get system detail with dependencies and relationships.
    """
    system = architecture_service.get_system_detail(db, system_id)
    if not system:
        raise HTTPException(status_code=404, detail="System not found")

    return {
        "success": True,
        "data": system
    }

@router.get("/metrics", response_model=ArchitectureMetricsResponse)
async def get_architecture_metrics(
    period: str = Query("7d", regex="^(1d|7d|30d|90d)$"),
    layer_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(require_user_type("lanh_dao_bo"))
):
    """
    Get architecture-wide metrics and statistics.
    """
    metrics = architecture_service.calculate_metrics(
        db,
        period=period,
        layer_id=layer_id
    )
    return {
        "success": True,
        "data": metrics,
        "meta": {
            "period": period,
            "timestamp": datetime.utcnow()
        }
    }

@router.get("/summary", response_model=ArchitectureSummaryResponse)
async def get_architecture_summary(
    db: Session = Depends(get_db),
    current_user = Depends(require_user_type("lanh_dao_bo"))
):
    """
    Get high-level summary for dashboard overview.
    """
    summary = architecture_service.get_summary(db)
    return {
        "success": True,
        "data": summary,
        "meta": {
            "last_updated": datetime.utcnow()
        }
    }
```

---

## Service Layer: `architecture_service.py`

```python
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from typing import List, Optional, Tuple

from app.models import (
    ArchitectureLayer,
    ArchitectureComponent,
    System,
    SystemDependency
)

class ArchitectureService:

    def get_layers_with_metrics(self, db: Session) -> List[dict]:
        """Get all layers with system counts and metrics."""
        query = db.query(
            ArchitectureLayer,
            func.count(System.id).label('total_systems'),
            func.sum(case((System.deployment_status == 'production', 1), else_=0)).label('production_systems'),
            func.sum(case((System.health_status == 'healthy', 1), else_=0)).label('healthy_systems')
        ).outerjoin(
            System, System.architecture_layer_id == ArchitectureLayer.id
        ).group_by(
            ArchitectureLayer.id
        ).order_by(
            ArchitectureLayer.display_order
        )

        results = []
        for layer, total, production, healthy in query.all():
            completion_rate = (production / total * 100) if total > 0 else 0
            results.append({
                "id": layer.id,
                "code": layer.code,
                "name_vi": layer.name_vi,
                "name_en": layer.name_en,
                "description_vi": layer.description_vi,
                "color_code": layer.color_code,
                "icon": layer.icon,
                "display_order": layer.display_order,
                "metrics": {
                    "total_systems": total,
                    "production_systems": production,
                    "healthy_systems": healthy,
                    "completion_rate": round(completion_rate, 2)
                }
            })

        return results

    def get_components(
        self,
        db: Session,
        layer_id: Optional[int] = None,
        include_systems: bool = True,
        include_children: bool = False
    ) -> List[dict]:
        """Get components with optional filters."""
        query = db.query(ArchitectureComponent)

        if layer_id:
            query = query.filter(ArchitectureComponent.layer_id == layer_id)

        # Only get parent components first
        query = query.filter(ArchitectureComponent.parent_component_id.is_(None))
        query = query.order_by(ArchitectureComponent.display_order)

        components = query.all()
        results = []

        for component in components:
            comp_dict = {
                "id": component.id,
                "code": component.code,
                "name_vi": component.name_vi,
                "name_en": component.name_en,
                "layer": {
                    "id": component.layer.id,
                    "code": component.layer.code,
                    "name_vi": component.layer.name_vi,
                    "color_code": component.layer.color_code
                },
                "display_order": component.display_order
            }

            if include_systems:
                system_count = db.query(func.count(System.id)).filter(
                    System.architecture_component_id == component.id
                ).scalar()
                production_count = db.query(func.count(System.id)).filter(
                    System.architecture_component_id == component.id,
                    System.deployment_status == 'production'
                ).scalar()

                comp_dict["metrics"] = {
                    "total_systems": system_count,
                    "production_systems": production_count
                }

            if include_children:
                children = db.query(ArchitectureComponent).filter(
                    ArchitectureComponent.parent_component_id == component.id
                ).order_by(ArchitectureComponent.display_order).all()

                comp_dict["children"] = [
                    {
                        "id": child.id,
                        "code": child.code,
                        "name_vi": child.name_vi,
                        "display_order": child.display_order
                    }
                    for child in children
                ]
            else:
                comp_dict["children"] = []

            results.append(comp_dict)

        return results

    def get_systems(
        self,
        db: Session,
        layer_id: Optional[int] = None,
        component_id: Optional[int] = None,
        deployment_status: Optional[str] = None,
        health_status: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        limit: int = 20
    ) -> Tuple[List[dict], int]:
        """Get systems with filters and pagination."""
        query = db.query(System)

        if layer_id:
            query = query.filter(System.architecture_layer_id == layer_id)
        if component_id:
            query = query.filter(System.architecture_component_id == component_id)
        if deployment_status:
            query = query.filter(System.deployment_status == deployment_status)
        if health_status:
            query = query.filter(System.health_status == health_status)
        if search:
            query = query.filter(System.name.ilike(f"%{search}%"))

        total = query.count()
        offset = (page - 1) * limit
        systems = query.offset(offset).limit(limit).all()

        results = []
        for system in systems:
            results.append({
                "id": system.id,
                "name": system.name,
                "code": system.code,
                "organization_name": system.organization_name,
                "department_name": system.department_name,
                "deployment_status": system.deployment_status,
                "health_status": system.health_status,
                "architecture": {
                    "layer": {
                        "id": system.architecture_layer.id,
                        "code": system.architecture_layer.code,
                        "name_vi": system.architecture_layer.name_vi
                    } if system.architecture_layer else None,
                    "component": {
                        "id": system.architecture_component.id,
                        "code": system.architecture_component.code,
                        "name_vi": system.architecture_component.name_vi
                    } if system.architecture_component else None
                },
                "created_at": system.created_at,
                "updated_at": system.updated_at
            })

        return results, total

architecture_service = ArchitectureService()
```

---

## Caching Strategy

### Redis Cache Keys
```
arch:layers                          # TTL: 1 hour
arch:components:layer:{layer_id}     # TTL: 30 min
arch:systems:component:{comp_id}     # TTL: 5 min
arch:metrics:summary                 # TTL: 1 min
arch:system:{system_id}              # TTL: 5 min
```

### Cache Invalidation
Invalidate cache when:
- System created/updated/deleted
- Architecture mapping changed
- Deployment status changed
- Health status changed

---

## Rate Limiting

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.get("/layers")
@limiter.limit("100/minute")  # 100 requests per minute
async def get_architecture_layers(...):
    ...
```

---

## Testing

### Unit Tests
```python
def test_get_layers_with_metrics(db_session):
    layers = architecture_service.get_layers_with_metrics(db_session)
    assert len(layers) == 5
    assert layers[0]["code"] == "L1"
    assert "metrics" in layers[0]
    assert "completion_rate" in layers[0]["metrics"]

def test_get_components_filtered_by_layer(db_session):
    components = architecture_service.get_components(db_session, layer_id=3)
    for comp in components:
        assert comp["layer"]["id"] == 3
```

### Integration Tests
```python
def test_api_get_layers(client, auth_headers):
    response = client.get("/api/v1/architecture/layers", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    assert len(data["data"]) == 5
```

---

## Next Steps

1. ✅ API endpoints designed → This document
2. ⏭️ Implement backend services
3. ⏭️ Write unit tests
4. ⏭️ Frontend integration
5. ⏭️ End-to-end testing
