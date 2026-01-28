from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Sum, Avg
from django.db.models.functions import Coalesce
from django.conf import settings
import json
import logging

from apps.accounts.permissions import IsOrgUserOrAdmin, CanManageOrgSystems
from .models import System, Attachment

logger = logging.getLogger(__name__)
from .serializers import (
    SystemListSerializer,
    SystemDetailSerializer,
    SystemCreateUpdateSerializer,
    AttachmentSerializer,
)
from .utils import calculate_system_completion_percentage


class SystemViewSet(viewsets.ModelViewSet):
    """
    ViewSet for System CRUD operations

    Endpoints:
    - GET /api/systems/ - List all systems
    - POST /api/systems/ - Create new system
    - GET /api/systems/{id}/ - Retrieve system detail
    - PUT /api/systems/{id}/ - Update system
    - PATCH /api/systems/{id}/ - Partial update
    - DELETE /api/systems/{id}/ - Delete system
    - POST /api/systems/{id}/save_draft/ - Save as draft
    - POST /api/systems/{id}/submit/ - Submit for review
    """

    queryset = System.objects.select_related('org').prefetch_related(
        'architecture',
        'data_info',
        'operations',
        'integration',
        'assessment',
        'cost',
        'vendor',
        'infrastructure',
        'security',
        'attachments',
    ).all()
    permission_classes = [IsOrgUserOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    # P0.8: Added new filterset fields for technology stack
    filterset_fields = [
        'org', 'status', 'criticality_level', 'form_level', 'system_group',
        'programming_language', 'framework', 'database_name', 'hosting_platform'
    ]
    # P0.8: Added new search fields for technology stack
    search_fields = [
        'system_code', 'system_name', 'system_name_en', 'purpose',
        'business_owner', 'technical_owner',
        'programming_language', 'framework', 'database_name'
    ]
    ordering_fields = ['created_at', 'updated_at', 'system_code', 'system_name', 'go_live_date']
    ordering = ['-created_at']

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return SystemListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return SystemCreateUpdateSerializer
        return SystemDetailSerializer

    def get_queryset(self):
        """Filter queryset based on user role"""
        queryset = super().get_queryset()
        user = self.request.user

        # Exclude soft-deleted systems
        queryset = queryset.filter(is_deleted=False)

        # Admin can see all systems
        if user.role == 'admin':
            return queryset

        # Org user can only see systems from their organization
        if user.role == 'org_user' and user.organization:
            return queryset.filter(org=user.organization)

        # If user has no organization assigned, return empty queryset
        return queryset.none()

    def perform_create(self, serializer):
        """
        Auto-set org field from logged-in user's organization
        - Org users: auto-set from their organization
        - Admin users: allow explicit org in request (can create for any org)
        """
        user = self.request.user

        # Org users: use their organization
        if user.role == 'org_user':
            if not user.organization:
                from rest_framework.exceptions import ValidationError
                raise ValidationError({'error': 'User must be assigned to an organization'})
            serializer.save(org=user.organization)
        # Admin users: require explicit org in request
        elif user.role == 'admin':
            serializer.save()
        else:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'error': 'Invalid user role'})

    @action(detail=True, methods=['post'])
    def save_draft(self, request, pk=None):
        """Save system as draft"""
        system = self.get_object()
        system.status = 'draft'
        system.save()
        serializer = self.get_serializer(system)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit system for review"""
        system = self.get_object()
        system.status = 'active'
        system.save()
        serializer = self.get_serializer(system)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get system statistics with average completion percentage"""
        queryset = self.get_queryset()

        # Calculate average completion percentage
        systems = list(queryset)
        if systems:
            total_completion = sum(
                calculate_system_completion_percentage(system)
                for system in systems
            )
            avg_completion = round(total_completion / len(systems), 1)
        else:
            avg_completion = 0.0

        stats = {
            'total': queryset.count(),
            'average_completion_percentage': avg_completion,
            'by_status': {
                'operating': queryset.filter(status='operating').count(),
                'pilot': queryset.filter(status='pilot').count(),
                'stopped': queryset.filter(status='stopped').count(),
                'replacing': queryset.filter(status='replacing').count(),
            },
            'by_criticality': {
                # P0.8: Removed 'critical' option per customer request
                'high': queryset.filter(criticality_level='high').count(),
                'medium': queryset.filter(criticality_level='medium').count(),
                'low': queryset.filter(criticality_level='low').count(),
            },
            'by_form_level': {
                'level_1': queryset.filter(form_level=1).count(),
                'level_2': queryset.filter(form_level=2).count(),
            },
        }

        return Response(stats)

    @action(detail=False, methods=['get'])
    def strategic_stats(self, request):
        """
        Strategic Dashboard - Overview Statistics
        Returns comprehensive stats for strategic dashboard overview tab.
        Only accessible by lanhdaobo role.
        """
        user = request.user
        if user.role != 'lanhdaobo':
            return Response(
                {'error': 'Chỉ Lãnh đạo Bộ mới có quyền xem Dashboard chiến lược'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get all active systems
        queryset = System.objects.filter(is_deleted=False)
        total_systems = queryset.count()

        # Organization count
        from apps.organizations.models import Organization
        total_orgs = Organization.objects.count()

        # Status distribution
        status_distribution = {
            'operating': queryset.filter(status='operating').count(),
            'pilot': queryset.filter(status='pilot').count(),
            'testing': queryset.filter(status='testing').count(),
            'stopped': queryset.filter(status='stopped').count(),
            'replacing': queryset.filter(status='replacing').count(),
        }

        # Criticality distribution
        criticality_distribution = {
            'high': queryset.filter(criticality_level='high').count(),
            'medium': queryset.filter(criticality_level='medium').count(),
            'low': queryset.filter(criticality_level='low').count(),
        }

        # Scope distribution
        scope_distribution = {
            'internal_unit': queryset.filter(scope='internal_unit').count(),
            'org_wide': queryset.filter(scope='org_wide').count(),
            'external': queryset.filter(scope='external').count(),
        }

        # Systems per organization (top 10)
        systems_per_org = list(
            queryset.values('org__name')
            .annotate(count=Count('id'))
            .order_by('-count')[:10]
        )

        # Recommendation distribution (from assessment)
        recommendation_distribution = {
            'keep': 0,
            'upgrade': 0,
            'replace': 0,
            'merge': 0,
            'unknown': 0,
        }
        for system in queryset.select_related('assessment'):
            try:
                if hasattr(system, 'assessment') and system.assessment:
                    rec = system.assessment.recommendation
                    if rec in recommendation_distribution:
                        recommendation_distribution[rec] += 1
                    else:
                        recommendation_distribution['unknown'] += 1
                else:
                    recommendation_distribution['unknown'] += 1
            except Exception:
                recommendation_distribution['unknown'] += 1

        # Integration stats
        total_api_provided = queryset.aggregate(
            total=Coalesce(Sum('api_provided_count'), 0)
        )['total']
        total_api_consumed = queryset.aggregate(
            total=Coalesce(Sum('api_consumed_count'), 0)
        )['total']

        systems_with_integration = queryset.filter(
            Q(api_provided_count__gt=0) | Q(api_consumed_count__gt=0)
        ).count()
        systems_without_integration = total_systems - systems_with_integration

        # Calculate health score
        health_score = 100
        health_score -= status_distribution.get('stopped', 0) * 5
        health_score -= recommendation_distribution.get('replace', 0) * 3
        health_score -= recommendation_distribution.get('unknown', 0) * 0.5
        if total_systems > 0:
            integration_rate = systems_with_integration / total_systems
            health_score += integration_rate * 10
        health_score = max(0, min(100, round(health_score)))

        # Alerts
        alerts = {
            'critical': recommendation_distribution.get('replace', 0),
            'warning': status_distribution.get('stopped', 0),
            'info': recommendation_distribution.get('unknown', 0),
        }

        return Response({
            'overview': {
                'total_systems': total_systems,
                'total_organizations': total_orgs,
                'health_score': health_score,
                'alerts': alerts,
            },
            'status_distribution': status_distribution,
            'criticality_distribution': criticality_distribution,
            'scope_distribution': scope_distribution,
            'systems_per_org': systems_per_org,
            'recommendation_distribution': recommendation_distribution,
            'integration': {
                'total_api_provided': total_api_provided,
                'total_api_consumed': total_api_consumed,
                'with_integration': systems_with_integration,
                'without_integration': systems_without_integration,
            },
        })

    @action(detail=False, methods=['get'])
    def investment_stats(self, request):
        """
        Strategic Dashboard - Investment Analytics
        Returns cost/investment data per organization.
        Only accessible by lanhdaobo role.
        """
        user = request.user
        if user.role != 'lanhdaobo':
            return Response(
                {'error': 'Chỉ Lãnh đạo Bộ mới có quyền xem Dashboard chiến lược'},
                status=status.HTTP_403_FORBIDDEN
            )

        from apps.organizations.models import Organization

        queryset = System.objects.filter(is_deleted=False)

        # Total investment across all systems
        total_investment = 0
        cost_breakdown = {
            'development': 0,
            'license': 0,
            'maintenance': 0,
            'infrastructure': 0,
            'personnel': 0,
        }

        for system in queryset.select_related('cost'):
            try:
                if hasattr(system, 'cost') and system.cost:
                    cost = system.cost
                    if cost.initial_investment:
                        total_investment += float(cost.initial_investment)
                    if cost.development_cost:
                        cost_breakdown['development'] += float(cost.development_cost)
                    if cost.annual_license_cost:
                        cost_breakdown['license'] += float(cost.annual_license_cost)
                    if cost.annual_maintenance_cost:
                        cost_breakdown['maintenance'] += float(cost.annual_maintenance_cost)
                    if cost.annual_infrastructure_cost:
                        cost_breakdown['infrastructure'] += float(cost.annual_infrastructure_cost)
                    if cost.annual_personnel_cost:
                        cost_breakdown['personnel'] += float(cost.annual_personnel_cost)
            except Exception:
                pass

        # Investment by organization
        by_organization = []
        for org in Organization.objects.all():
            org_systems = queryset.filter(org=org)
            system_count = org_systems.count()
            org_total_cost = 0

            for sys in org_systems.select_related('cost'):
                try:
                    if hasattr(sys, 'cost') and sys.cost and sys.cost.initial_investment:
                        org_total_cost += float(sys.cost.initial_investment)
                except Exception:
                    pass

            if system_count > 0:
                by_organization.append({
                    'org_id': org.id,
                    'org_name': org.name,
                    'system_count': system_count,
                    'total_cost': org_total_cost,
                })

        by_organization.sort(key=lambda x: x['system_count'], reverse=True)

        # Cost efficiency metrics
        total_users = queryset.aggregate(total=Coalesce(Sum('users_total'), 0))['total']
        avg_cost_per_user = total_investment / total_users if total_users > 0 else 0

        return Response({
            'total_investment': total_investment,
            'by_organization': by_organization[:15],
            'cost_breakdown': cost_breakdown,
            'cost_efficiency': {
                'avg_cost_per_user': round(avg_cost_per_user, 2),
                'total_users': total_users,
            },
        })

    @action(detail=False, methods=['get'])
    def integration_stats(self, request):
        """
        Strategic Dashboard - Integration Analytics
        Returns API and integration statistics.
        Only accessible by lanhdaobo role.
        """
        user = request.user
        if user.role != 'lanhdaobo':
            return Response(
                {'error': 'Chỉ Lãnh đạo Bộ mới có quyền xem Dashboard chiến lược'},
                status=status.HTTP_403_FORBIDDEN
            )

        queryset = System.objects.filter(is_deleted=False)
        total_systems = queryset.count()

        # API counts
        total_api_provided = queryset.aggregate(
            total=Coalesce(Sum('api_provided_count'), 0)
        )['total']
        total_api_consumed = queryset.aggregate(
            total=Coalesce(Sum('api_consumed_count'), 0)
        )['total']

        # Systems with/without integration
        systems_with_integration = queryset.filter(
            Q(api_provided_count__gt=0) | Q(api_consumed_count__gt=0)
        ).count()
        systems_without_integration = total_systems - systems_with_integration

        # Data islands (systems with no integration)
        data_islands = list(
            queryset.filter(
                Q(api_provided_count__isnull=True) | Q(api_provided_count=0),
                Q(api_consumed_count__isnull=True) | Q(api_consumed_count=0)
            ).values_list('system_name', flat=True)[:10]
        )

        # Systems with most APIs
        top_api_providers = list(
            queryset.filter(api_provided_count__gt=0)
            .order_by('-api_provided_count')
            .values('id', 'system_name', 'api_provided_count')[:10]
        )

        top_api_consumers = list(
            queryset.filter(api_consumed_count__gt=0)
            .order_by('-api_consumed_count')
            .values('id', 'system_name', 'api_consumed_count')[:10]
        )

        return Response({
            'total_api_provided': total_api_provided,
            'total_api_consumed': total_api_consumed,
            'systems_with_integration': systems_with_integration,
            'systems_without_integration': systems_without_integration,
            'integration_rate': round((systems_with_integration / total_systems * 100), 1) if total_systems > 0 else 0,
            'data_islands': data_islands,
            'top_api_providers': top_api_providers,
            'top_api_consumers': top_api_consumers,
        })

    @action(detail=False, methods=['get'])
    def optimization_stats(self, request):
        """
        Strategic Dashboard - Optimization Analytics
        Returns recommendations and legacy system analysis.
        Only accessible by lanhdaobo role.
        """
        user = request.user
        if user.role != 'lanhdaobo':
            return Response(
                {'error': 'Chỉ Lãnh đạo Bộ mới có quyền xem Dashboard chiến lược'},
                status=status.HTTP_403_FORBIDDEN
            )

        from datetime import datetime, timedelta

        queryset = System.objects.filter(is_deleted=False)

        # Recommendation distribution
        recommendations = {
            'keep': 0,
            'upgrade': 0,
            'replace': 0,
            'merge': 0,
            'unknown': 0,
        }

        legacy_systems = []
        for system in queryset.select_related('assessment'):
            try:
                if hasattr(system, 'assessment') and system.assessment:
                    rec = system.assessment.recommendation
                    if rec in recommendations:
                        recommendations[rec] += 1
                    else:
                        recommendations['unknown'] += 1

                    # Collect systems marked for replacement
                    if rec == 'replace':
                        legacy_systems.append({
                            'id': system.id,
                            'name': system.system_name,
                            'org_name': system.org.name if system.org else None,
                            'go_live_date': system.go_live_date.isoformat() if system.go_live_date else None,
                            'users': system.users_total or 0,
                        })
                else:
                    recommendations['unknown'] += 1
            except Exception:
                recommendations['unknown'] += 1

        # Systems that need attention (stopped or replacing)
        attention_needed = list(
            queryset.filter(status__in=['stopped', 'replacing'])
            .values('id', 'system_name', 'status', 'org__name')[:10]
        )

        return Response({
            'recommendations': recommendations,
            'legacy_systems': legacy_systems[:10],
            'attention_needed': attention_needed,
            'total_needing_action': recommendations['replace'] + recommendations['upgrade'],
            'assessment_coverage': round(
                ((queryset.count() - recommendations['unknown']) / queryset.count() * 100), 1
            ) if queryset.count() > 0 else 0,
        })

    @action(detail=False, methods=['get'])
    def monitoring_stats(self, request):
        """
        Strategic Dashboard - Monitoring Analytics
        Returns organization rankings and completion stats.
        Only accessible by lanhdaobo role.
        """
        user = request.user
        if user.role != 'lanhdaobo':
            return Response(
                {'error': 'Chỉ Lãnh đạo Bộ mới có quyền xem Dashboard chiến lược'},
                status=status.HTTP_403_FORBIDDEN
            )

        from apps.organizations.models import Organization

        queryset = System.objects.filter(is_deleted=False)

        # Organization rankings
        organization_rankings = []
        for org in Organization.objects.all():
            org_systems = list(queryset.filter(org=org))
            system_count = len(org_systems)

            if system_count > 0:
                # Calculate average completion
                total_completion = sum(
                    calculate_system_completion_percentage(sys)
                    for sys in org_systems
                )
                avg_completion = round(total_completion / system_count, 1)

                # Calculate average performance (if available)
                performance_scores = []
                for sys in org_systems:
                    try:
                        if hasattr(sys, 'assessment') and sys.assessment and sys.assessment.performance_rating:
                            performance_scores.append(sys.assessment.performance_rating)
                    except Exception:
                        pass

                avg_performance = round(sum(performance_scores) / len(performance_scores), 1) if performance_scores else None

                organization_rankings.append({
                    'org_id': org.id,
                    'org_name': org.name,
                    'system_count': system_count,
                    'avg_completion': avg_completion,
                    'avg_performance': avg_performance,
                })

        # Sort by system count
        organization_rankings.sort(key=lambda x: x['system_count'], reverse=True)

        # Overall stats
        all_systems = list(queryset)
        total_completion = sum(
            calculate_system_completion_percentage(sys)
            for sys in all_systems
        )
        avg_completion_all = round(total_completion / len(all_systems), 1) if all_systems else 0

        return Response({
            'organization_rankings': organization_rankings,
            'summary': {
                'total_organizations': len(organization_rankings),
                'avg_completion_all': avg_completion_all,
                'orgs_with_100_percent': sum(1 for o in organization_rankings if o['avg_completion'] == 100),
                'orgs_below_50_percent': sum(1 for o in organization_rankings if o['avg_completion'] < 50),
            },
        })

    @action(detail=False, methods=['get'])
    def drilldown(self, request):
        """
        Strategic Dashboard - Drill-down endpoint
        Returns list of systems matching specific criteria.
        Query params:
        - filter_type: status, criticality, scope, recommendation, org, integration
        - filter_value: the specific value to filter by
        """
        user = request.user
        if user.role != 'lanhdaobo':
            return Response(
                {'error': 'Chỉ Lãnh đạo Bộ mới có quyền xem Dashboard chiến lược'},
                status=status.HTTP_403_FORBIDDEN
            )

        filter_type = request.query_params.get('filter_type')
        filter_value = request.query_params.get('filter_value')

        if not filter_type or not filter_value:
            return Response(
                {'error': 'filter_type and filter_value are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        queryset = System.objects.filter(is_deleted=False)

        if filter_type == 'status':
            queryset = queryset.filter(status=filter_value)
        elif filter_type == 'criticality':
            queryset = queryset.filter(criticality_level=filter_value)
        elif filter_type == 'scope':
            queryset = queryset.filter(scope=filter_value)
        elif filter_type == 'org':
            queryset = queryset.filter(org__name=filter_value)
        elif filter_type == 'integration':
            if filter_value == 'with':
                queryset = queryset.filter(
                    Q(api_provided_count__gt=0) | Q(api_consumed_count__gt=0)
                )
            elif filter_value == 'without':
                queryset = queryset.filter(
                    Q(api_provided_count__isnull=True) | Q(api_provided_count=0),
                    Q(api_consumed_count__isnull=True) | Q(api_consumed_count=0)
                )
        elif filter_type == 'recommendation':
            # Need to filter through assessment relation
            # Match logic with strategic_stats recommendation_distribution calculation
            valid_recommendations = ['keep', 'upgrade', 'replace', 'merge']
            system_ids = []
            for system in queryset.select_related('assessment'):
                try:
                    if hasattr(system, 'assessment') and system.assessment:
                        rec = system.assessment.recommendation
                        if filter_value == 'unknown':
                            # System has assessment but recommendation not in valid list
                            if rec not in valid_recommendations:
                                system_ids.append(system.id)
                        else:
                            # Match specific recommendation
                            if rec == filter_value:
                                system_ids.append(system.id)
                    else:
                        # System has no assessment → counts as unknown
                        if filter_value == 'unknown':
                            system_ids.append(system.id)
                except Exception:
                    # Exception accessing assessment → counts as unknown
                    if filter_value == 'unknown':
                        system_ids.append(system.id)
            queryset = queryset.filter(id__in=system_ids)

        # Return paginated results
        systems = list(
            queryset.select_related('org')
            .values(
                'id', 'system_name', 'system_code', 'status',
                'criticality_level', 'scope', 'org__name',
                'users_total', 'go_live_date'
            )[:100]
        )

        return Response({
            'count': len(systems),
            'filter_type': filter_type,
            'filter_value': filter_value,
            'systems': systems,
        })

    @action(detail=False, methods=['get'])
    def insights(self, request):
        """
        Strategic Dashboard - Rule-based Insights
        Automatically analyzes system data and surfaces important insights.
        Only accessible by lanhdaobo role.
        """
        user = request.user
        if user.role != 'lanhdaobo':
            return Response(
                {'error': 'Chỉ Lãnh đạo Bộ mới có quyền xem Dashboard chiến lược'},
                status=status.HTTP_403_FORBIDDEN
            )

        queryset = System.objects.filter(is_deleted=False)
        total_systems = queryset.count()

        insights = []

        # === DOCUMENTATION INSIGHTS ===
        # Systems without design docs
        no_design_docs = queryset.filter(has_design_documents=False).count()
        if no_design_docs > 0:
            pct = round(no_design_docs / total_systems * 100, 1)
            insights.append({
                'id': 'no_design_docs',
                'category': 'documentation',
                'severity': 'warning' if pct > 50 else 'info',
                'title': f'{no_design_docs} hệ thống chưa có tài liệu thiết kế',
                'description': f'{pct}% hệ thống thiếu tài liệu thiết kế, ảnh hưởng đến khả năng bảo trì và nâng cấp.',
                'recommendation': 'Ưu tiên bổ sung tài liệu cho các hệ thống mức độ quan trọng cao.',
                'metric': {'count': no_design_docs, 'percentage': pct},
                'filter': {'type': 'no_design_docs'},
            })

        # Systems without architecture diagram
        no_arch_diagram = queryset.filter(
            Q(architecture__has_architecture_diagram=False) | Q(architecture__isnull=True)
        ).count()
        if no_arch_diagram > 0:
            pct = round(no_arch_diagram / total_systems * 100, 1)
            insights.append({
                'id': 'no_arch_diagram',
                'category': 'documentation',
                'severity': 'warning' if pct > 70 else 'info',
                'title': f'{no_arch_diagram} hệ thống chưa có sơ đồ kiến trúc',
                'description': f'{pct}% hệ thống thiếu sơ đồ kiến trúc, gây khó khăn trong việc đánh giá và tích hợp.',
                'recommendation': 'Xây dựng sơ đồ kiến trúc cho các hệ thống core trước.',
                'metric': {'count': no_arch_diagram, 'percentage': pct},
                'filter': {'type': 'no_arch_diagram'},
            })

        # === DEVOPS INSIGHTS ===
        # Systems without CI/CD
        no_cicd = queryset.filter(
            Q(architecture__has_cicd=False) | Q(architecture__isnull=True)
        ).count()
        if no_cicd > 0:
            pct = round(no_cicd / total_systems * 100, 1)
            insights.append({
                'id': 'no_cicd',
                'category': 'devops',
                'severity': 'warning' if pct > 80 else 'info',
                'title': f'{no_cicd} hệ thống chưa có CI/CD',
                'description': f'{pct}% hệ thống triển khai thủ công, tăng rủi ro lỗi và thời gian release.',
                'recommendation': 'Triển khai CI/CD pipeline cho các hệ thống có tần suất release cao.',
                'metric': {'count': no_cicd, 'percentage': pct},
                'filter': {'type': 'no_cicd'},
            })

        # Systems without API Gateway
        no_api_gateway = queryset.filter(
            Q(integration__has_api_gateway=False) | Q(integration__isnull=True)
        ).count()
        if no_api_gateway > 0:
            pct = round(no_api_gateway / total_systems * 100, 1)
            insights.append({
                'id': 'no_api_gateway',
                'category': 'integration',
                'severity': 'warning' if pct > 70 else 'info',
                'title': f'{no_api_gateway} hệ thống chưa có API Gateway',
                'description': f'{pct}% hệ thống thiếu API Gateway, khó kiểm soát và bảo mật API.',
                'recommendation': 'Triển khai API Gateway tập trung theo kiến trúc tổng thể.',
                'metric': {'count': no_api_gateway, 'percentage': pct},
                'filter': {'type': 'no_api_gateway'},
            })

        # === INFRASTRUCTURE INSIGHTS ===
        # Systems still on-premise
        on_premise = queryset.filter(hosting_platform='on_premise').count()
        if on_premise > 0:
            pct = round(on_premise / total_systems * 100, 1)
            insights.append({
                'id': 'on_premise',
                'category': 'infrastructure',
                'severity': 'info',
                'title': f'{on_premise} hệ thống còn on-premise',
                'description': f'{pct}% hệ thống chạy on-premise. Theo lộ trình chuyển đổi số, cần đánh giá khả năng di chuyển lên Cloud.',
                'recommendation': 'Lập kế hoạch Cloud migration theo giai đoạn 1 (2026).',
                'metric': {'count': on_premise, 'percentage': pct},
                'filter': {'type': 'hosting_platform', 'value': 'on_premise'},
            })

        # Systems on cloud
        on_cloud = queryset.filter(hosting_platform='cloud').count()
        if on_cloud > 0:
            pct = round(on_cloud / total_systems * 100, 1)
            insights.append({
                'id': 'cloud_ready',
                'category': 'infrastructure',
                'severity': 'success',
                'title': f'{on_cloud} hệ thống đã lên Cloud',
                'description': f'{pct}% hệ thống đã triển khai trên Cloud, đáp ứng định hướng kiến trúc hiện đại.',
                'recommendation': 'Tiếp tục mở rộng và tối ưu hóa chi phí Cloud.',
                'metric': {'count': on_cloud, 'percentage': pct},
                'filter': {'type': 'hosting_platform', 'value': 'cloud'},
            })

        # === TECHNOLOGY INSIGHTS ===
        # Technology distribution
        tech_stats = list(
            queryset.exclude(Q(programming_language__isnull=True) | Q(programming_language=''))
            .values('programming_language')
            .annotate(count=Count('id'))
            .order_by('-count')[:5]
        )
        if tech_stats:
            top_tech = tech_stats[0]
            top_pct = round(top_tech['count'] / total_systems * 100, 1)
            tech_list = ', '.join(["{} ({})".format(t['programming_language'], t['count']) for t in tech_stats])
            insights.append({
                'id': 'tech_distribution',
                'category': 'technology',
                'severity': 'info',
                'title': f"Ngôn ngữ phổ biến nhất: {top_tech['programming_language']} ({top_tech['count']} hệ thống)",
                'description': f"Top 5: {tech_list}",
                'recommendation': 'Xem xét chuẩn hóa công nghệ để dễ bảo trì và tìm nhân sự.',
                'metric': {'top': tech_stats},
                'filter': {'type': 'technology'},
            })

        # Database distribution
        db_stats = list(
            queryset.exclude(Q(database_name__isnull=True) | Q(database_name=''))
            .values('database_name')
            .annotate(count=Count('id'))
            .order_by('-count')[:5]
        )
        if db_stats:
            db_list = ', '.join(["{} ({})".format(d['database_name'], d['count']) for d in db_stats])
            insights.append({
                'id': 'database_distribution',
                'category': 'technology',
                'severity': 'info',
                'title': f"Database phổ biến nhất: {db_stats[0]['database_name']} ({db_stats[0]['count']} hệ thống)",
                'description': f"Top 5: {db_list}",
                'recommendation': 'Đánh giá khả năng hợp nhất database để giảm chi phí vận hành.',
                'metric': {'top': db_stats},
                'filter': {'type': 'database'},
            })

        # === SECURITY INSIGHTS ===
        # Systems without data encryption
        no_encryption = queryset.filter(has_encryption=False).count()
        if no_encryption > 0:
            pct = round(no_encryption / total_systems * 100, 1)
            insights.append({
                'id': 'no_encryption',
                'category': 'security',
                'severity': 'critical' if pct > 50 else 'warning',
                'title': f'{no_encryption} hệ thống chưa mã hóa dữ liệu',
                'description': f'{pct}% hệ thống chưa mã hóa dữ liệu at-rest, tiềm ẩn rủi ro bảo mật.',
                'recommendation': 'Ưu tiên triển khai mã hóa cho các hệ thống xử lý dữ liệu nhạy cảm.',
                'metric': {'count': no_encryption, 'percentage': pct},
                'filter': {'type': 'no_encryption'},
            })

        # === ASSESSMENT INSIGHTS ===
        # Systems not assessed
        not_assessed = 0
        needs_upgrade = 0
        needs_replace = 0
        for system in queryset.select_related('assessment'):
            try:
                if not hasattr(system, 'assessment') or not system.assessment:
                    not_assessed += 1
                elif system.assessment.recommendation == 'upgrade':
                    needs_upgrade += 1
                elif system.assessment.recommendation == 'replace':
                    needs_replace += 1
            except Exception:
                not_assessed += 1

        if not_assessed > 0:
            pct = round(not_assessed / total_systems * 100, 1)
            insights.append({
                'id': 'not_assessed',
                'category': 'assessment',
                'severity': 'warning' if pct > 50 else 'info',
                'title': f'{not_assessed} hệ thống chưa được đánh giá',
                'description': f'{pct}% hệ thống chưa có kết quả assessment, không thể lập kế hoạch tối ưu.',
                'recommendation': 'Hoàn thiện đánh giá để có cơ sở lập lộ trình nâng cấp.',
                'metric': {'count': not_assessed, 'percentage': pct},
                'filter': {'type': 'recommendation', 'value': 'unknown'},
            })

        if needs_replace > 0:
            insights.append({
                'id': 'needs_replace',
                'category': 'assessment',
                'severity': 'critical',
                'title': f'{needs_replace} hệ thống cần thay thế',
                'description': 'Các hệ thống này được đánh giá cần thay thế do lỗi thời hoặc không đáp ứng yêu cầu.',
                'recommendation': 'Lập kế hoạch thay thế và chuyển đổi dữ liệu.',
                'metric': {'count': needs_replace},
                'filter': {'type': 'recommendation', 'value': 'replace'},
            })

        if needs_upgrade > 0:
            insights.append({
                'id': 'needs_upgrade',
                'category': 'assessment',
                'severity': 'warning',
                'title': f'{needs_upgrade} hệ thống cần nâng cấp',
                'description': 'Các hệ thống này cần nâng cấp để cải thiện hiệu năng hoặc tính năng.',
                'recommendation': 'Lập kế hoạch nâng cấp theo thứ tự ưu tiên.',
                'metric': {'count': needs_upgrade},
                'filter': {'type': 'recommendation', 'value': 'upgrade'},
            })

        # Sort insights by severity
        severity_order = {'critical': 0, 'warning': 1, 'info': 2, 'success': 3}
        insights.sort(key=lambda x: severity_order.get(x['severity'], 99))

        # Summary stats
        summary = {
            'total_insights': len(insights),
            'critical': sum(1 for i in insights if i['severity'] == 'critical'),
            'warning': sum(1 for i in insights if i['severity'] == 'warning'),
            'info': sum(1 for i in insights if i['severity'] == 'info'),
            'success': sum(1 for i in insights if i['severity'] == 'success'),
        }

        return Response({
            'insights': insights,
            'summary': summary,
            'total_systems': total_systems,
        })

    @action(detail=False, methods=['post'])
    def ai_query(self, request):
        """
        Strategic Dashboard - AI SQL Assistant
        Uses OpenAI to interpret natural language queries about system data.
        Only accessible by lanhdaobo role.

        Features:
        - Retry mechanism (up to 3 attempts) with error feedback to OpenAI
        - User-friendly error messages in Vietnamese when all retries fail

        Request body:
        {
            "query": "Có bao nhiêu hệ thống đang dùng Java?"
        }
        """
        user = request.user
        if user.role != 'lanhdaobo':
            return Response(
                {'error': 'Chỉ Lãnh đạo Bộ mới có quyền xem Dashboard chiến lược'},
                status=status.HTTP_403_FORBIDDEN
            )

        query = request.data.get('query', '').strip()
        if not query:
            return Response(
                {'error': 'Query is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check which AI provider to use (default: OpenAI)
        import os
        use_claude = os.environ.get('USE_CLAUDE_AI', 'false').lower() == 'true'

        if use_claude:
            # Anthropic API key
            api_key = os.environ.get('ANTHROPIC_API_KEY', getattr(settings, 'ANTHROPIC_API_KEY', None))
            if not api_key:
                return Response(
                    {'error': 'Anthropic API key not configured'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            # OpenAI API key (default)
            api_key = os.environ.get('OPENAI_API_KEY', getattr(settings, 'OPENAI_API_KEY', None))
            if not api_key:
                return Response(
                    {'error': 'OpenAI API key not configured'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        # Build comprehensive database schema context
        schema_context = """
=== DATABASE SCHEMA FOR IT SYSTEMS INVENTORY ===

TABLE: systems (db_table='systems')
Primary Key: id (integer, auto-increment)
Foreign Keys: org_id -> organizations.id

Columns:
- id: INTEGER PRIMARY KEY
- org_id: INTEGER FK -> organizations.id (required)
- system_code: VARCHAR(100) - Auto-generated format: SYS-ORG-YYYY-XXXX
- system_name: VARCHAR(255) - Tên hệ thống (required)
- system_name_en: VARCHAR(255) - Tên tiếng Anh
- purpose: TEXT - Mục đích hệ thống
- scope: VARCHAR(50) - Phạm vi sử dụng
    VALUES: 'internal_unit' (Nội bộ đơn vị), 'org_wide' (Toàn bộ), 'external' (Bên ngoài)
- system_group: TEXT - Nhóm hệ thống
    COMMON VALUES: 'national_platform', 'shared_platform', 'specialized_db', 'business_app', 'portal', 'bi', 'esb', 'other'
- status: VARCHAR(20) - Trạng thái
    VALUES: 'operating' (Đang vận hành), 'pilot' (Thí điểm), 'testing' (Đang thử nghiệm), 'stopped' (Dừng), 'replacing' (Sắp thay thế)
- requirement_type: VARCHAR(10000) - Nhu cầu
    VALUES: 'new_build', 'upgrade', 'integration', 'replacement', 'expansion', 'other'
- criticality_level: VARCHAR(20) - Mức độ quan trọng
    VALUES: 'high' (Quan trọng), 'medium' (Trung bình), 'low' (Thấp)
- hosting_platform: VARCHAR(50) - Nền tảng triển khai
    VALUES: 'cloud', 'on_premise', 'hybrid', 'other'
- programming_language: TEXT - Ngôn ngữ lập trình (e.g., Python, Java, JavaScript)
- framework: TEXT - Framework/Library (e.g., Django, Spring Boot, React)
- database_name: TEXT - Database (e.g., PostgreSQL, MySQL, MongoDB)
- users_total: INTEGER - Tổng số người dùng
- total_accounts: INTEGER - Tổng số tài khoản
- users_mau: INTEGER - Monthly Active Users
- users_dau: INTEGER - Daily Active Users
- annual_users: INTEGER - Số người dùng hàng năm
- num_organizations: INTEGER - Số đơn vị sử dụng
- api_provided_count: INTEGER - Số API cung cấp
- api_consumed_count: INTEGER - Số API tiêu thụ
- go_live_date: DATE - Ngày vận hành
- target_completion_date: DATE - Ngày mong muốn hoàn thành
- current_version: VARCHAR(50) - Phiên bản hiện tại
- security_level: INTEGER - Mức độ ATTT (1-5)
- has_design_documents: BOOLEAN - Có tài liệu thiết kế?
- has_encryption: BOOLEAN - Có mã hóa dữ liệu?
- has_audit_log: BOOLEAN - Có audit log?
- has_data_catalog: BOOLEAN - Có Data Catalog?
- has_mdm: BOOLEAN - Có Master Data Management?
- has_security_documents: BOOLEAN - Có tài liệu ATTT?
- form_level: INTEGER - Level biểu mẫu (1 or 2)
- is_deleted: BOOLEAN - Soft delete flag (ALWAYS filter: is_deleted = false)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- business_owner: TEXT
- technical_owner: TEXT
- responsible_person: TEXT
- responsible_phone: VARCHAR(20)
- responsible_email: EMAIL

---

TABLE: organizations (db_table='organizations')
Primary Key: id (integer)

Columns:
- id: INTEGER PRIMARY KEY
- name: VARCHAR(255) UNIQUE - Tên đơn vị
- code: VARCHAR(50) UNIQUE - Mã đơn vị
- description: TEXT - Mô tả
- contact_person: VARCHAR(255) - Người liên hệ
- contact_email: EMAIL
- contact_phone: VARCHAR(20)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

---

TABLE: system_architecture (db_table='system_architecture')
Primary Key: system_id (FK -> systems.id, one-to-one)

Columns:
- system_id: INTEGER PRIMARY KEY FK -> systems.id
- architecture_type: VARCHAR(50) - Loại kiến trúc
    VALUES: 'monolithic', 'modular', 'microservices', 'soa', 'serverless', 'saas', 'other'
- has_architecture_diagram: BOOLEAN - Có sơ đồ kiến trúc?
- architecture_description: TEXT
- backend_tech: TEXT - Backend technology
- frontend_tech: TEXT - Frontend technology
- mobile_app: VARCHAR(50)
    VALUES: 'native', 'hybrid', 'pwa', 'none', 'other'
- database_type: TEXT - Loại database
- database_model: VARCHAR(50)
    VALUES: 'centralized' (Tập trung), 'distributed' (Phân tán), 'per_app' (Riêng từng app), 'other'
- has_data_model_doc: BOOLEAN - Có tài liệu data model?
- hosting_type: TEXT - cloud, on-premise, hybrid
- cloud_provider: TEXT
- has_layered_architecture: BOOLEAN - Có kiến trúc 4-tier?
- containerization: TEXT - Comma-separated: docker,kubernetes,openshift
- is_multi_tenant: BOOLEAN - Hỗ trợ multi-tenant?
- api_style: VARCHAR(50)
    VALUES: 'rest', 'graphql', 'grpc', 'soap', 'other'
- messaging_queue: VARCHAR(50)
    VALUES: 'kafka', 'rabbitmq', 'activemq', 'redis_pubsub', 'none', 'other'
- cache_system: VARCHAR(10000)
    VALUES: 'redis', 'memcached', 'none', 'other'
- search_engine: VARCHAR(10000)
    VALUES: 'elasticsearch', 'solr', 'none', 'other'
- reporting_bi_tool: VARCHAR(10000)
    VALUES: 'powerbi', 'tableau', 'metabase', 'superset', 'custom', 'none', 'other'
- source_repository: VARCHAR(10000)
    VALUES: 'gitlab', 'github', 'bitbucket', 'azure_devops', 'on_premise', 'none', 'other'
- has_cicd: BOOLEAN - Có CI/CD pipeline?
- cicd_tool: VARCHAR(100)
- has_automated_testing: BOOLEAN
- automated_testing_tools: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

---

TABLE: system_operations (db_table='system_operations')
Primary Key: system_id (FK -> systems.id, one-to-one)

Columns:
- system_id: INTEGER PRIMARY KEY FK -> systems.id
- dev_type: VARCHAR(50) - Loại phát triển
    VALUES: 'internal' (Nội bộ), 'outsource' (Thuê ngoài), 'combined' (Kết hợp), 'other'
- developer: TEXT - Đơn vị phát triển
- dev_team_size: INTEGER
- warranty_status: VARCHAR(50)
    VALUES: 'active' (Còn bảo hành), 'expired' (Hết bảo hành), 'none' (Không có), 'other'
- warranty_end_date: DATE
- has_maintenance_contract: BOOLEAN
- maintenance_end_date: DATE
- operator: TEXT - Đơn vị vận hành
- ops_team_size: INTEGER
- vendor_dependency: VARCHAR(20) - Phụ thuộc nhà cung cấp
    VALUES: 'high', 'medium', 'low', 'none', 'other'
- can_self_maintain: BOOLEAN - Tự vận hành được?
- support_level: TEXT
- avg_incident_response_hours: DECIMAL(5,2)
- deployment_location: VARCHAR(50)
    VALUES: 'datacenter', 'cloud', 'hybrid', 'other'
- compute_type: VARCHAR(50)
    VALUES: 'vm', 'container', 'serverless', 'bare_metal', 'other'
- compute_specifications: TEXT
- deployment_frequency: VARCHAR(50)
    VALUES: 'daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'on_demand'
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

---

TABLE: system_integration (db_table='system_integration')
Primary Key: system_id (FK -> systems.id, one-to-one)

Columns:
- system_id: INTEGER PRIMARY KEY FK -> systems.id
- has_integration: BOOLEAN - Có tích hợp?
- integration_count: INTEGER - Số lượng tích hợp
- integration_types: JSONB - Danh sách loại tích hợp: ["api", "esb", "file", "database"]
- connected_internal_systems: TEXT
- connected_external_systems: TEXT
- has_integration_diagram: BOOLEAN
- integration_description: TEXT
- uses_standard_api: BOOLEAN
- api_standard: TEXT - REST, SOAP, GraphQL, etc.
- has_api_gateway: BOOLEAN - Có API Gateway?
- api_gateway_name: TEXT - Tên API Gateway (Kong, AWS, Azure, etc.)
- has_api_versioning: BOOLEAN
- has_rate_limiting: BOOLEAN
- api_provided_count: INTEGER
- api_consumed_count: INTEGER
- api_documentation: TEXT
- api_versioning_standard: TEXT
- has_integration_monitoring: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

---

TABLE: system_assessment (db_table='system_assessment')
Primary Key: system_id (FK -> systems.id, one-to-one)

Columns:
- system_id: INTEGER PRIMARY KEY FK -> systems.id
- performance_rating: INTEGER - Đánh giá hiệu năng (IMPORTANT: INTEGER 1-5, NOT VARCHAR!)
    VALUES: 1 (Rất kém), 2 (Kém), 3 (Trung bình), 4 (Tốt), 5 (Rất tốt)
- uptime_percent: DECIMAL(5,2) - Thời gian hoạt động (%)
- avg_response_time_ms: INTEGER - Thời gian phản hồi trung bình (ms)
- user_satisfaction_rating: INTEGER - Đánh giá hài lòng người dùng (1-5)
- technical_debt_level: VARCHAR(20) - Mức nợ kỹ thuật
    VALUES: 'high', 'medium', 'low'
- needs_replacement: BOOLEAN - Cần thay thế?
- replacement_plan: TEXT
- major_issues: TEXT
- improvement_suggestions: TEXT
- future_plans: TEXT
- modernization_priority: VARCHAR(20)
    VALUES: 'high', 'medium', 'low'
- integration_readiness: JSONB - Điểm phù hợp tích hợp
- blockers: JSONB - Điểm vướng
- recommendation: VARCHAR(10000) - Đề xuất của đơn vị
    VALUES: 'keep' (Giữ nguyên), 'upgrade' (Nâng cấp), 'replace' (Thay thế), 'merge' (Hợp nhất), 'other'
- recommendation_other: TEXT - Chi tiết nếu chọn 'other'
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

---

TABLE: system_cost (db_table='system_cost')
Primary Key: system_id (FK -> systems.id, one-to-one)

Columns:
- system_id: INTEGER PRIMARY KEY FK -> systems.id
- initial_investment: DECIMAL(15,2) - Chi phí đầu tư ban đầu (VND)
- development_cost: DECIMAL(15,2) - Chi phí phát triển
- annual_license_cost: DECIMAL(15,2) - Chi phí license hàng năm
- annual_maintenance_cost: DECIMAL(15,2) - Chi phí bảo trì hàng năm
- annual_infrastructure_cost: DECIMAL(15,2) - Chi phí hạ tầng hàng năm
- annual_personnel_cost: DECIMAL(15,2) - Chi phí nhân sự hàng năm
- total_cost_of_ownership: DECIMAL(15,2) - TCO 5 năm
- cost_notes: TEXT
- funding_source: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

---

TABLE: system_security (db_table='system_security')
Primary Key: system_id (FK -> systems.id, one-to-one)

Columns:
- system_id: INTEGER PRIMARY KEY FK -> systems.id
- auth_method: VARCHAR(100) - Phương thức xác thực
- has_mfa: BOOLEAN - Có MFA?
- has_rbac: BOOLEAN - Có RBAC?
- has_data_encryption_at_rest: BOOLEAN - Mã hóa dữ liệu lưu trữ?
- has_data_encryption_in_transit: BOOLEAN - Mã hóa dữ liệu truyền tải?
- has_firewall: BOOLEAN
- has_waf: BOOLEAN - Có WAF?
- has_ids_ips: BOOLEAN - Có IDS/IPS?
- has_antivirus: BOOLEAN
- last_security_audit_date: DATE
- last_penetration_test_date: DATE
- has_vulnerability_scanning: BOOLEAN
- compliance_standards: JSONB - e.g., ["ISO27001", "GDPR", "PCIDSS"]
- security_incidents_last_year: INTEGER
- security_notes: TEXT
- security_improvements_needed: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

---

TABLE: system_data_info (db_table='system_data_info')
Primary Key: system_id (FK -> systems.id, one-to-one)

Columns:
- system_id: INTEGER PRIMARY KEY FK -> systems.id
- storage_size_gb: DECIMAL(10,2) - Dung lượng CSDL (GB)
- file_storage_size_gb: DECIMAL(10,2) - Dung lượng file (GB)
- growth_rate_percent: DECIMAL(5,2) - Tốc độ tăng trưởng (%/năm)
- data_types: JSONB - ["business", "documents", "stats", "master"]
- has_api: BOOLEAN
- api_endpoints_count: INTEGER
- shared_with_systems: TEXT
- has_data_standard: BOOLEAN
- has_personal_data: BOOLEAN - Có dữ liệu cá nhân?
- has_sensitive_data: BOOLEAN - Có dữ liệu nhạy cảm?
- data_classification: VARCHAR(50) - public, internal, confidential, secret
- secondary_databases: JSONB
- file_storage_type: VARCHAR(50)
    VALUES: 'file_server', 'object_storage', 'nas', 'database_blob', 'none', 'other'
- record_count: BIGINT - Số bản ghi
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

---

TABLE: system_infrastructure (db_table='system_infrastructure')
Primary Key: system_id (FK -> systems.id, one-to-one)

Columns:
- system_id: INTEGER PRIMARY KEY FK -> systems.id
- num_servers: INTEGER
- server_specs: TEXT
- total_cpu_cores: INTEGER
- total_ram_gb: DECIMAL(10,2)
- total_storage_tb: DECIMAL(10,2)
- bandwidth_mbps: INTEGER
- has_cdn: BOOLEAN
- has_load_balancer: BOOLEAN
- backup_frequency: VARCHAR(50) - daily, weekly, real-time
- backup_retention_days: INTEGER
- has_disaster_recovery: BOOLEAN
- rto_hours: DECIMAL(5,2) - Recovery Time Objective
- rpo_hours: DECIMAL(5,2) - Recovery Point Objective
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

---

TABLE: system_vendor (db_table='system_vendor')
Primary Key: system_id (FK -> systems.id, one-to-one)

Columns:
- system_id: INTEGER PRIMARY KEY FK -> systems.id
- vendor_name: TEXT
- vendor_type: VARCHAR(100) - domestic, foreign, joint_venture
- vendor_contact_person: TEXT
- vendor_phone: VARCHAR(20)
- vendor_email: EMAIL
- contract_number: VARCHAR(100)
- contract_start_date: DATE
- contract_end_date: DATE
- contract_value: DECIMAL(15,2)
- vendor_performance_rating: INTEGER (1-5)
- vendor_responsiveness_rating: INTEGER (1-5)
- vendor_lock_in_risk: VARCHAR(20) - high, medium, low
- alternative_vendors: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

---

TABLE: users (db_table='users')
Primary Key: id (integer)

Columns:
- id: INTEGER PRIMARY KEY
- username: VARCHAR
- email: EMAIL
- role: VARCHAR(20)
    VALUES: 'admin', 'org_user', 'lanhdaobo'
- organization_id: INTEGER FK -> organizations.id
- phone: VARCHAR(20)

=== CRITICAL NOTES ===
1. ALWAYS filter systems with: is_deleted = false
2. performance_rating is INTEGER (1-5), NOT a string!
3. recommendation is VARCHAR with values: keep, upgrade, replace, merge, other
4. Join related tables using system_id as the foreign key
5. Use table aliases: s for systems, o for organizations, sa for system_assessment, etc.
6. All one-to-one related tables use system_id as both PK and FK

=== EXAMPLE QUERIES ===

-- Count systems by status
SELECT status, COUNT(*) as count FROM systems WHERE is_deleted = false GROUP BY status;

-- Get systems with performance rating
SELECT s.system_name, sa.performance_rating, sa.recommendation
FROM systems s
LEFT JOIN system_assessment sa ON s.id = sa.system_id
WHERE s.is_deleted = false AND sa.performance_rating IS NOT NULL;

-- Systems by organization
SELECT o.name as org_name, COUNT(s.id) as system_count
FROM organizations o
LEFT JOIN systems s ON o.id = s.org_id AND s.is_deleted = false
GROUP BY o.id, o.name;
"""

        # Initialize AI client based on provider
        if use_claude:
            from anthropic import Anthropic
            client = Anthropic(api_key=api_key)
        else:
            import requests
            openai_client = None  # Use requests for OpenAI API

        # Helper function to validate and execute SQL
        def validate_and_execute_sql(sql):
            """
            Validate SQL safety and execute it.
            Returns (query_result, error_message) tuple.
            """
            # Clean SQL: remove markdown code blocks, extra whitespace
            sql = sql.strip()
            # Remove markdown code blocks (```sql ... ``` or ``` ... ```)
            if sql.startswith('```'):
                lines = sql.split('\n')
                # Remove first line (```sql or ```) and last line (```)
                if lines[0].startswith('```'):
                    lines = lines[1:]
                if lines and lines[-1].strip() == '```':
                    lines = lines[:-1]
                sql = '\n'.join(lines)
            sql = sql.strip().rstrip(';')  # Remove trailing semicolon

            # Basic safety check
            sql_upper = sql.upper()
            # Allow SELECT and WITH (for CTEs)
            is_safe_start = sql_upper.startswith('SELECT') or sql_upper.startswith('WITH')
            # Check for dangerous keywords as whole words (using regex word boundaries)
            # This prevents false positives like "is_deleted" matching "DELETE"
            import re as regex_check
            dangerous_keywords = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'TRUNCATE', 'CREATE']
            has_dangerous = any(regex_check.search(rf'\b{keyword}\b', sql_upper) for keyword in dangerous_keywords)
            # Also check for SQL comments
            has_dangerous = has_dangerous or '--' in sql
            # Check for multiple statements (semicolon in middle of query)
            has_multiple_statements = ';' in sql

            if not is_safe_start or has_dangerous or has_multiple_statements:
                return None, 'Query không an toàn, chỉ cho phép SELECT'

            try:
                from django.db import connection
                with connection.cursor() as cursor:
                    cursor.execute(sql)
                    columns = [col[0] for col in cursor.description]
                    rows = cursor.fetchall()
                    query_result = {
                        'columns': columns,
                        'rows': [dict(zip(columns, row)) for row in rows[:100]],  # Limit 100 rows
                        'total_rows': len(rows),
                    }
                    return query_result, None
            except Exception as e:
                return None, str(e)

        # Helper function to call AI API (Claude or OpenAI)
        def call_ai(system_prompt, conversation_messages):
            """
            Call AI API with system prompt and conversation messages.
            Returns the text response from the AI.
            """
            if use_claude:
                # Claude API
                response = client.messages.create(
                    model='claude-3-5-sonnet-20241022',
                    max_tokens=2000,
                    system=system_prompt,
                    messages=conversation_messages,
                )
                return response.content[0].text
            else:
                # OpenAI API via requests
                openai_messages = [{'role': 'system', 'content': system_prompt}]
                for msg in conversation_messages:
                    openai_messages.append({'role': msg['role'], 'content': msg['content']})

                response = requests.post(
                    'https://api.openai.com/v1/chat/completions',
                    headers={
                        'Authorization': f'Bearer {api_key}',
                        'Content-Type': 'application/json',
                    },
                    json={
                        'model': 'gpt-4-turbo-preview',
                        'messages': openai_messages,
                        'temperature': 0.1,
                        'max_tokens': 2000,
                    },
                    timeout=60
                )
                response.raise_for_status()
                return response.json()['choices'][0]['message']['content']

        # User-friendly error message in Vietnamese
        FRIENDLY_ERROR_MESSAGE = (
            "Xin lỗi, tôi không thể trả lời câu hỏi này do thiếu thông tin cần thiết "
            "hoặc câu hỏi quá phức tạp. Vui lòng thử hỏi theo cách khác hoặc đặt câu hỏi đơn giản hơn."
        )

        # Maximum retry attempts
        MAX_RETRIES = 3

        # Build system prompt for Claude
        system_prompt = f"""Bạn là trợ lý AI phân tích dữ liệu hệ thống CNTT cho Bộ Khoa học và Công nghệ Việt Nam.

{schema_context}

NHIỆM VỤ CỦA BẠN:
1. Phân tích câu hỏi của người dùng (bằng tiếng Việt)
2. Viết SQL query để trả lời câu hỏi (PostgreSQL syntax)
3. Giải thích kết quả bằng tiếng Việt

RESPONSE FORMAT (BẮT BUỘC trả về JSON hợp lệ):
{{
    "sql": "SELECT ... FROM ... WHERE ...",
    "explanation": "Giải thích câu query và cách hiểu kết quả bằng tiếng Việt",
    "chart_type": "bar|pie|table|number",
    "chart_config": {{"x_field": "tên cột cho trục x", "y_field": "tên cột cho trục y", "title": "Tiêu đề biểu đồ"}}
}}

QUY TẮC BẮT BUỘC:
1. LUÔN lọc is_deleted = false khi query bảng systems
2. Sử dụng đúng tên bảng: systems, organizations, system_architecture, system_assessment, system_operations, system_integration, system_security, system_cost, system_data_info, system_infrastructure, system_vendor
3. LUÔN dùng table aliases: s cho systems, o cho organizations, sa cho system_assessment, etc.
4. Join các bảng liên quan qua system_id (là primary key và foreign key của các bảng one-to-one)
5. Chỉ trả về SELECT queries, KHÔNG BAO GIỜ viết UPDATE/DELETE/DROP/INSERT
6. LUÔN trả về JSON hợp lệ, không có text thừa trước hoặc sau JSON
7. Trả lời bằng tiếng Việt

CRITICAL DATA TYPE RULES:
- performance_rating là INTEGER (1-5), KHÔNG PHẢI string! Dùng: WHERE sa.performance_rating = 5
- user_satisfaction_rating là INTEGER (1-5)
- recommendation là VARCHAR với giá trị: 'keep', 'upgrade', 'replace', 'merge', 'other'
- Các trường boolean dùng true/false, không phải 1/0

Nếu câu hỏi không rõ ràng hoặc không liên quan đến dữ liệu hệ thống, hãy trả về JSON với sql = null và giải thích trong explanation."""

        # Build initial conversation (Claude format)
        conversation = [{'role': 'user', 'content': query}]

        try:
            import re

            for attempt in range(MAX_RETRIES):
                logger.info(f"AI query attempt {attempt + 1}/{MAX_RETRIES} for query: {query[:100]}...")

                try:
                    ai_content = call_ai(system_prompt, conversation)
                except Exception as api_error:
                    provider = 'Claude' if use_claude else 'OpenAI'
                    logger.error(f"{provider} API error: {api_error}")
                    return Response(
                        {'error': 'AI service temporarily unavailable'},
                        status=status.HTTP_503_SERVICE_UNAVAILABLE
                    )

                # Parse AI response
                try:
                    json_match = re.search(r'\{[\s\S]*\}', ai_content)
                    if json_match:
                        ai_data = json.loads(json_match.group())
                    else:
                        ai_data = {'explanation': ai_content, 'sql': None}
                except json.JSONDecodeError:
                    ai_data = {'explanation': ai_content, 'sql': None}

                # If no SQL generated, return the explanation
                if not ai_data.get('sql'):
                    return Response({
                        'query': query,
                        'ai_response': ai_data,
                        'data': None,
                    })

                # Validate and execute SQL
                query_result, sql_error = validate_and_execute_sql(ai_data['sql'])

                if query_result is not None:
                    # SQL executed successfully
                    return Response({
                        'query': query,
                        'ai_response': ai_data,
                        'data': query_result,
                    })

                # SQL failed - prepare for retry
                logger.warning(f"SQL execution failed (attempt {attempt + 1}): {sql_error}")

                if attempt < MAX_RETRIES - 1:
                    # Add the failed attempt to conversation for context
                    conversation.append({'role': 'assistant', 'content': ai_content})
                    # Provide error feedback to Claude for correction
                    error_feedback = f"""SQL query bị lỗi khi thực thi. Lỗi: {sql_error}

Hãy sửa lại SQL query. Lưu ý:
- LUÔN dùng is_deleted = false khi query bảng systems
- performance_rating là kiểu INTEGER (1-5), không phải string
- recommendation là kiểu VARCHAR với các giá trị: keep, upgrade, replace, merge, other
- Kiểm tra lại data types của các cột trước khi so sánh
- Đảm bảo sử dụng đúng tên bảng (system_assessment KHÔNG PHẢI system_assessments)
- JOIN các bảng one-to-one bằng system_id

Vui lòng trả về JSON với SQL query đã sửa."""
                    conversation.append({'role': 'user', 'content': error_feedback})
                else:
                    # All retries exhausted - return user-friendly error
                    logger.error(f"All {MAX_RETRIES} attempts failed for query: {query}")
                    ai_data['error'] = FRIENDLY_ERROR_MESSAGE
                    ai_data['technical_error'] = sql_error  # Keep technical error for debugging
                    return Response({
                        'query': query,
                        'ai_response': ai_data,
                        'data': None,
                    })

            # Should not reach here, but just in case
            ai_data['error'] = FRIENDLY_ERROR_MESSAGE
            return Response({
                'query': query,
                'ai_response': ai_data,
                'data': None,
            })

        except Exception as e:
            logger.error(f"AI query error: {e}")
            return Response(
                {'error': 'Internal server error'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def roadmap_stats(self, request):
        """
        Strategic Dashboard - Roadmap Statistics
        Maps systems to digital transformation phases based on current state.
        Only accessible by lanhdaobo role.

        Phases based on "Kiến trúc tổng thể số thống nhất Bộ KH&CN":
        - Phase 1 (2026): Ổn định hạ tầng – Hội tụ dữ liệu – Thiết lập nền tảng
        - Phase 2 (2027-2028): Chuẩn hóa toàn diện – Tích hợp sâu – Số hóa nghiệp vụ
        - Phase 3 (2029-2030): Tối ưu hóa – Thông minh hóa – Dữ liệu mở
        """
        user = request.user
        if user.role != 'lanhdaobo':
            return Response(
                {'error': 'Chỉ Lãnh đạo Bộ mới có quyền xem Dashboard chiến lược'},
                status=status.HTTP_403_FORBIDDEN
            )

        queryset = System.objects.filter(is_deleted=False).select_related(
            'org', 'architecture', 'operations', 'integration', 'security', 'assessment'
        )
        total_systems = queryset.count()

        # Phase criteria mapping
        phase1_systems = []  # Need basic infrastructure improvements
        phase2_systems = []  # Need standardization and integration
        phase3_systems = []  # Ready for optimization and AI
        completed_systems = []  # Already meet most criteria

        for system in queryset:
            system_data = {
                'id': system.id,
                'name': system.system_name,
                'org_name': system.org.name if system.org else None,
                'status': system.status,
                'criticality': system.criticality_level,
                'improvements_needed': [],
                'score': 0,  # Higher = more mature
            }

            # Check Phase 1 criteria (Infrastructure & Foundation)
            # Cloud readiness
            if system.hosting_platform == 'cloud':
                system_data['score'] += 20
            elif system.hosting_platform == 'hybrid':
                system_data['score'] += 10
            else:
                system_data['improvements_needed'].append({
                    'phase': 1,
                    'action': 'Cloud Migration',
                    'detail': 'Di chuyển lên Cloud hoặc Hybrid',
                })

            # API Gateway
            has_api_gw = False
            try:
                if hasattr(system, 'integration') and system.integration:
                    has_api_gw = system.integration.has_api_gateway
            except Exception:
                pass

            if has_api_gw:
                system_data['score'] += 15
            else:
                system_data['improvements_needed'].append({
                    'phase': 1,
                    'action': 'API Gateway',
                    'detail': 'Triển khai API Gateway tập trung',
                })

            # Basic security (Encryption)
            has_encryption = system.has_encryption
            if has_encryption:
                system_data['score'] += 10
            else:
                system_data['improvements_needed'].append({
                    'phase': 1,
                    'action': 'Data Encryption',
                    'detail': 'Triển khai mã hóa dữ liệu',
                })

            # Check Phase 2 criteria (Standardization & Integration)
            # CI/CD
            has_cicd = False
            try:
                if hasattr(system, 'architecture') and system.architecture:
                    has_cicd = system.architecture.has_cicd
            except Exception:
                pass

            if has_cicd:
                system_data['score'] += 15
            else:
                system_data['improvements_needed'].append({
                    'phase': 2,
                    'action': 'CI/CD Pipeline',
                    'detail': 'Triển khai CI/CD tự động',
                })

            # Documentation
            has_docs = system.has_design_documents
            has_arch = False
            try:
                if hasattr(system, 'architecture') and system.architecture:
                    has_arch = system.architecture.has_architecture_diagram
            except Exception:
                pass

            if has_docs:
                system_data['score'] += 10
            else:
                system_data['improvements_needed'].append({
                    'phase': 2,
                    'action': 'Documentation',
                    'detail': 'Hoàn thiện tài liệu thiết kế',
                })

            if has_arch:
                system_data['score'] += 10
            else:
                system_data['improvements_needed'].append({
                    'phase': 2,
                    'action': 'Architecture Diagram',
                    'detail': 'Xây dựng sơ đồ kiến trúc',
                })

            # Audit Log (as proxy for monitoring)
            has_audit_log = system.has_audit_log
            if has_audit_log:
                system_data['score'] += 10
            else:
                system_data['improvements_needed'].append({
                    'phase': 2,
                    'action': 'Observability',
                    'detail': 'Triển khai Monitoring & Logging',
                })

            # Check Phase 3 criteria (Optimization & AI)
            # Data encryption
            has_encryption = False
            try:
                if hasattr(system, 'security') and system.security:
                    has_encryption = system.security.has_data_encryption_at_rest
            except Exception:
                pass

            if has_encryption:
                system_data['score'] += 10
            else:
                system_data['improvements_needed'].append({
                    'phase': 3,
                    'action': 'Data Encryption',
                    'detail': 'Mã hóa dữ liệu at-rest',
                })

            # Categorize by phase needed
            phase1_improvements = [i for i in system_data['improvements_needed'] if i['phase'] == 1]
            phase2_improvements = [i for i in system_data['improvements_needed'] if i['phase'] == 2]
            phase3_improvements = [i for i in system_data['improvements_needed'] if i['phase'] == 3]

            if phase1_improvements:
                system_data['current_phase'] = 1
                system_data['phase_label'] = 'Giai đoạn 1: Xây móng'
                phase1_systems.append(system_data)
            elif phase2_improvements:
                system_data['current_phase'] = 2
                system_data['phase_label'] = 'Giai đoạn 2: Chuẩn hóa'
                phase2_systems.append(system_data)
            elif phase3_improvements:
                system_data['current_phase'] = 3
                system_data['phase_label'] = 'Giai đoạn 3: Tối ưu hóa'
                phase3_systems.append(system_data)
            else:
                system_data['current_phase'] = 4
                system_data['phase_label'] = 'Hoàn thành'
                completed_systems.append(system_data)

        # Sort each phase by criticality (high first)
        criticality_order = {'high': 0, 'medium': 1, 'low': 2}
        for systems_list in [phase1_systems, phase2_systems, phase3_systems, completed_systems]:
            systems_list.sort(key=lambda x: criticality_order.get(x['criticality'], 99))

        # Phase summary
        phase_summary = {
            'phase1': {
                'name': 'Giai đoạn 1 (2026)',
                'title': 'Xây móng - Hội tụ dữ liệu',
                'description': 'Ổn định hạ tầng, Cloud migration, API Gateway, SSL/TLS',
                'count': len(phase1_systems),
                'percentage': round(len(phase1_systems) / total_systems * 100, 1) if total_systems > 0 else 0,
            },
            'phase2': {
                'name': 'Giai đoạn 2 (2027-2028)',
                'title': 'Chuẩn hóa - Tích hợp sâu',
                'description': 'CI/CD, Documentation, Monitoring, Logging',
                'count': len(phase2_systems),
                'percentage': round(len(phase2_systems) / total_systems * 100, 1) if total_systems > 0 else 0,
            },
            'phase3': {
                'name': 'Giai đoạn 3 (2029-2030)',
                'title': 'Tối ưu hóa - Thông minh hóa',
                'description': 'Data encryption, AI integration, Open data',
                'count': len(phase3_systems),
                'percentage': round(len(phase3_systems) / total_systems * 100, 1) if total_systems > 0 else 0,
            },
            'completed': {
                'name': 'Hoàn thành',
                'title': 'Đạt chuẩn',
                'description': 'Đã đáp ứng các tiêu chí chuyển đổi số',
                'count': len(completed_systems),
                'percentage': round(len(completed_systems) / total_systems * 100, 1) if total_systems > 0 else 0,
            },
        }

        # Top priorities for each phase
        top_priorities = {
            'phase1': phase1_systems[:10],
            'phase2': phase2_systems[:10],
            'phase3': phase3_systems[:10],
        }

        # Improvement actions summary
        all_improvements = []
        for system in queryset:
            system_data = {
                'id': system.id,
                'name': system.system_name,
            }
            # Re-calculate improvements for summary
            for sys_list in [phase1_systems, phase2_systems, phase3_systems]:
                for s in sys_list:
                    if s['id'] == system.id:
                        all_improvements.extend(s['improvements_needed'])
                        break

        # Count improvements by action
        from collections import Counter
        action_counts = Counter(i['action'] for i in all_improvements)
        improvement_actions = [
            {'action': action, 'count': count, 'phase': next(
                (i['phase'] for i in all_improvements if i['action'] == action), 1
            )}
            for action, count in action_counts.most_common()
        ]

        return Response({
            'summary': phase_summary,
            'top_priorities': top_priorities,
            'improvement_actions': improvement_actions,
            'total_systems': total_systems,
            'systems_by_phase': {
                'phase1': phase1_systems,
                'phase2': phase2_systems,
                'phase3': phase3_systems,
                'completed': completed_systems,
            },
        })

    @action(detail=False, methods=['get'])
    def export_data(self, request):
        """
        Export all systems with full details for Excel export.
        Returns SystemDetailSerializer data for all systems (no pagination).

        Query params:
        - search: Filter by search term
        - org: Filter by organization ID
        - status: Filter by status
        """
        queryset = self.get_queryset()

        # Apply search filter
        search = request.query_params.get('search', '')
        if search:
            queryset = queryset.filter(
                Q(system_code__icontains=search) |
                Q(system_name__icontains=search) |
                Q(system_name_en__icontains=search) |
                Q(purpose__icontains=search)
            )

        # Apply org filter
        org_id = request.query_params.get('org')
        if org_id:
            queryset = queryset.filter(org_id=org_id)

        # Apply status filter
        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Order by org name, then system name
        queryset = queryset.order_by('org__name', 'system_name')

        # Serialize with full details
        serializer = SystemDetailSerializer(queryset, many=True)

        return Response({
            'count': queryset.count(),
            'results': serializer.data
        })

    @action(detail=False, methods=['get'])
    def completion_stats(self, request):
        """
        Get detailed completion statistics for systems.
        Includes per-system completion percentage and per-org aggregates.

        Query params:
        - org: Filter by organization ID
        - status: Filter by system status
        - completion_min: Min completion % (0-100)
        - completion_max: Max completion % (0-100)
        - ordering: Sort field (e.g., 'completion_percentage', '-system_name')
        """
        from collections import defaultdict
        from .utils import get_incomplete_fields, REQUIRED_FIELDS_MAP, CONDITIONAL_FIELDS_MAP

        queryset = self.get_queryset()

        # Apply filters
        org_id = request.query_params.get('org')
        if org_id:
            queryset = queryset.filter(org_id=org_id)

        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Get all systems with completion data
        systems_data = []
        org_stats = defaultdict(lambda: {
            'id': None,
            'name': '',
            'system_count': 0,
            'total_completion': 0.0,
            'systems_100_percent': 0,
            'systems_below_50_percent': 0,
        })

        for system in queryset.select_related('org'):
            completion = calculate_system_completion_percentage(system)
            incomplete = get_incomplete_fields(system)

            # Calculate total required fields for this system
            total_required = sum(len(fields) for fields in REQUIRED_FIELDS_MAP.values())

            # Add conditional fields if applicable
            for field_name, condition_field in CONDITIONAL_FIELDS_MAP.items():
                if getattr(system, condition_field, False):
                    total_required += 1

            filled = total_required - len(incomplete)

            system_data = {
                'id': system.id,
                'system_name': system.system_name,
                'system_code': system.system_code or f'SYS-{system.id}',
                'org_id': system.org.id if system.org else None,
                'org_name': system.org.name if system.org else None,
                'status': system.status,
                'criticality_level': system.criticality_level,
                'completion_percentage': completion,
                'filled_fields': filled,
                'total_required_fields': total_required,
                'incomplete_fields': incomplete,
                'last_updated': system.updated_at if hasattr(system, 'updated_at') else None,
            }

            # Apply completion range filter
            completion_min = request.query_params.get('completion_min')
            completion_max = request.query_params.get('completion_max')
            if completion_min and completion < float(completion_min):
                continue
            if completion_max and completion > float(completion_max):
                continue

            systems_data.append(system_data)

            # Update org stats
            if system.org:
                org_key = system.org.id
                org_stats[org_key]['id'] = system.org.id
                org_stats[org_key]['name'] = system.org.name
                org_stats[org_key]['system_count'] += 1
                org_stats[org_key]['total_completion'] += completion
                if completion == 100.0:
                    org_stats[org_key]['systems_100_percent'] += 1
                if completion < 50.0:
                    org_stats[org_key]['systems_below_50_percent'] += 1

        # Calculate org averages
        org_list = []
        for org_key, stats in org_stats.items():
            stats['avg_completion'] = round(
                stats['total_completion'] / stats['system_count'], 1
            ) if stats['system_count'] > 0 else 0.0
            del stats['total_completion']  # Remove temp field
            org_list.append(stats)

        # Include all organizations (even those without systems)
        from apps.organizations.models import Organization
        all_orgs = Organization.objects.all()
        existing_org_ids = {stats['id'] for stats in org_list}
        for org in all_orgs:
            if org.id not in existing_org_ids:
                org_list.append({
                    'id': org.id,
                    'name': org.name,
                    'system_count': 0,
                    'avg_completion': 0.0,
                    'systems_100_percent': 0,
                    'systems_below_50_percent': 0,
                })

        # Sort org_list by name for consistent ordering
        org_list.sort(key=lambda x: x['name'])

        # Sort systems
        ordering = request.query_params.get('ordering', 'system_name')
        reverse = ordering.startswith('-')
        sort_key = ordering.lstrip('-')

        if sort_key == 'completion_percentage':
            systems_data.sort(key=lambda x: x['completion_percentage'], reverse=reverse)
        elif sort_key == 'system_name':
            systems_data.sort(key=lambda x: x['system_name'], reverse=reverse)
        elif sort_key == 'org_name':
            systems_data.sort(key=lambda x: x['org_name'] or '', reverse=reverse)

        # Calculate summary
        total_systems = len(systems_data)
        avg_completion_all = round(
            sum(s['completion_percentage'] for s in systems_data) / total_systems, 1
        ) if total_systems > 0 else 0.0
        systems_100 = sum(1 for s in systems_data if s['completion_percentage'] == 100.0)
        systems_below_50 = sum(1 for s in systems_data if s['completion_percentage'] < 50.0)

        return Response({
            'count': total_systems,
            'results': systems_data,
            'summary': {
                'organizations': org_list,
                'total_systems': total_systems,
                'avg_completion_all': avg_completion_all,
                'systems_100_percent': systems_100,
                'systems_below_50_percent': systems_below_50,
            }
        })

    def destroy(self, request, *args, **kwargs):
        """
        Soft delete system
        - Admin can delete any system
        - Org user can only delete systems in their organization
        """
        system = self.get_object()
        user = request.user

        # Check permission: Admin can delete any, org_user can only delete their org's systems
        if user.role == 'org_user' and system.org != user.organization:
            return Response(
                {'error': 'Bạn không có quyền xóa hệ thống này'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Soft delete
        from django.utils import timezone
        system.is_deleted = True
        system.deleted_at = timezone.now()
        system.deleted_by = user
        system.save()

        return Response(
            {'message': f'Đã xóa hệ thống "{system.system_name}" thành công'},
            status=status.HTTP_204_NO_CONTENT
        )


class AttachmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Attachment CRUD operations

    Endpoints:
    - GET /api/attachments/ - List all attachments
    - POST /api/attachments/ - Upload new attachment
    - GET /api/attachments/{id}/ - Retrieve attachment detail
    - PUT /api/attachments/{id}/ - Update attachment
    - DELETE /api/attachments/{id}/ - Delete attachment
    """

    queryset = Attachment.objects.select_related('system', 'uploaded_by').all()
    serializer_class = AttachmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['system', 'attachment_type']
    search_fields = ['filename', 'description']
    ordering_fields = ['uploaded_at', 'file_size']
    ordering = ['-uploaded_at']

    def perform_create(self, serializer):
        """Auto-set uploaded_by and file metadata"""
        serializer.save(uploaded_by=self.request.user)

    def get_queryset(self):
        """Filter attachments based on user role"""
        queryset = super().get_queryset()
        user = self.request.user

        # Admin can see all attachments
        if user.role == 'admin':
            return queryset

        # Org user can only see attachments from their organization's systems
        if user.role == 'org_user' and user.organization:
            return queryset.filter(system__org=user.organization)

        # If user has no organization assigned, return empty queryset
        return queryset.none()

class UnitProgressDashboardView(APIView):
    """
    P0.9: Unit Progress Dashboard API

    GET /api/systems/dashboard/unit-progress/

    Returns progress statistics for the current user's organization:
    - Total systems count
    - Overall completion percentage
    - Per-system completion data with percentages

    Permissions: IsAuthenticated (org_user or admin)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get progress dashboard data for the user's organization."""
        user = request.user

        # Admin users must specify an organization ID
        if user.role == 'admin':
            org_id = request.query_params.get('org_id')
            if not org_id:
                return Response(
                    {
                        'error': 'Admin users must specify org_id parameter',
                        'example': '/api/systems/dashboard/unit-progress/?org_id=1'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            try:
                from apps.accounts.models import Organization
                organization = Organization.objects.get(id=org_id)
            except Organization.DoesNotExist:
                return Response(
                    {'error': f'Organization with id={org_id} not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            # Org users use their assigned organization
            organization = user.organization
            if not organization:
                return Response(
                    {'error': 'User is not assigned to any organization'},
                    status=status.HTTP_403_FORBIDDEN
                )

        # Get all systems for this organization (exclude soft-deleted)
        systems = System.objects.filter(
            org=organization,
            is_deleted=False
        ).select_related('org').order_by('-updated_at')

        # Calculate completion percentage for each system
        systems_data = []
        total_completion = 0.0
        for system in systems:
            completion_percentage = calculate_system_completion_percentage(system)
            total_completion += completion_percentage

            systems_data.append({
                'id': system.id,
                'system_name': system.system_name,
                'system_code': system.system_code,
                'status': system.status,
                'completion_percentage': completion_percentage,
                'created_at': system.created_at.isoformat() if system.created_at else None,
                'updated_at': system.updated_at.isoformat() if system.updated_at else None,
            })

        # Calculate overall completion percentage
        total_systems = len(systems_data)
        overall_completion_percentage = (
            round(total_completion / total_systems, 1) if total_systems > 0 else 0.0
        )

        # Count systems by completion level
        complete_systems = sum(1 for s in systems_data if s['completion_percentage'] >= 100.0)
        incomplete_systems = total_systems - complete_systems

        # Response data
        response_data = {
            'organization': {
                'id': organization.id,
                'name': organization.name,
                'org_code': organization.code,
            },
            'total_systems': total_systems,
            'overall_completion_percentage': overall_completion_percentage,
            'complete_systems': complete_systems,
            'incomplete_systems': incomplete_systems,
            'systems': systems_data,
        }

        return Response(response_data, status=status.HTTP_200_OK)
