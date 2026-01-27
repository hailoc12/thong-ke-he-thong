from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Sum, Avg
from django.db.models.functions import Coalesce

from apps.accounts.permissions import IsOrgUserOrAdmin, CanManageOrgSystems
from .models import System, Attachment
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
