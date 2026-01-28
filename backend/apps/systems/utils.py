"""
Utility functions for the systems app.
"""
from decimal import Decimal
from typing import Dict, List, Any


# Define required fields per tab for completion percentage calculation
# These match the 72 required fields in frontend systemValidationRules.ts
REQUIRED_FIELDS_MAP: Dict[str, List[str]] = {
    'tab1': ['org', 'system_name', 'system_name_en', 'purpose', 'status', 'criticality_level', 'scope', 'system_group'],
    'tab2': ['business_objectives', 'business_processes', 'user_types', 'annual_users'],
    'tab3': ['programming_language', 'framework', 'database_name', 'hosting_platform', 'architecture_type', 'backend_tech', 'frontend_tech', 'mobile_app'],
    'tab4': ['data_sources', 'data_types', 'data_classification_type', 'data_volume', 'storage_size_gb', 'file_storage_size_gb', 'growth_rate_percent', 'file_storage_type', 'record_count', 'secondary_databases'],
    'tab5': ['data_exchange_method'],
    'tab6': ['authentication_method', 'has_encryption', 'has_audit_log', 'security_level'],
    'tab7': ['server_configuration', 'backup_plan', 'storage_capacity', 'disaster_recovery_plan'],
    'tab8': ['business_owner', 'technical_owner', 'responsible_phone', 'responsible_email', 'support_level', 'users_mau', 'users_dau'],
    'tab9': ['integration_readiness', 'blockers'],
}

# Conditional required fields - only count if condition is met
CONDITIONAL_FIELDS_MAP: Dict[str, str] = {
    'cloud_provider': 'hosting_type',  # Required if hosting_type = 'cloud' (special check needed)
    'cicd_tool': 'has_cicd',  # Required if has_cicd = True
    'automated_testing_tools': 'has_automated_testing',  # Required if has_automated_testing = True
    'layered_architecture_details': 'has_layered_architecture',  # Required if has_layered_architecture = True
    'data_catalog_notes': 'has_data_catalog',  # Required if has_data_catalog = True
    'mdm_notes': 'has_mdm',  # Required if has_mdm = True
    # Note: is_go_live/go_live_date handled specially - see GO_LIVE_FIELDS_LOGIC
}

# Special logic for is_go_live and go_live_date fields:
# - If is_go_live is None: Don't count either field (system not yet updated)
# - If is_go_live is not None (True or False): Count both fields
#   - is_go_live counts as filled (since it's not None)
#   - go_live_date must be filled to count as filled
GO_LIVE_FIELDS_LOGIC = True  # Flag to enable special handling


def is_field_filled(value: Any) -> bool:
    """
    Check if a field value is considered "filled" (not empty).

    Args:
        value: The field value to check

    Returns:
        bool: True if the field is filled, False otherwise
    """
    if value is None:
        return False

    if isinstance(value, str):
        return bool(value.strip())

    if isinstance(value, (list, dict)):
        return len(value) > 0

    if isinstance(value, bool):
        # Boolean fields are always considered filled (True or False both count)
        return True

    if isinstance(value, (int, float, Decimal)):
        return True

    # ForeignKey and other model instances are considered filled if not None
    # This handles org (ForeignKey to Organization) and other related fields
    return True


def calculate_system_completion_percentage(system_instance: Any) -> float:
    """
    Calculate the completion percentage of a system based on required fields.
    Includes both always-required fields and conditional fields.

    Args:
        system_instance: The System model instance to calculate completion for

    Returns:
        float: Completion percentage (0.0 to 100.0)
    """
    if system_instance is None:
        return 0.0

    total_required_fields = 0
    filled_fields = 0

    # Count always-required fields
    for tab_key, field_names in REQUIRED_FIELDS_MAP.items():
        for field_name in field_names:
            total_required_fields += 1

            # Get the field value from the system instance
            try:
                # Tab 3: Some fields are in SystemArchitecture model
                if tab_key == 'tab3' and field_name in ['architecture_type', 'architecture_description', 'backend_tech', 'frontend_tech', 'mobile_app', 'database_type', 'database_model', 'hosting_type']:
                    if hasattr(system_instance, 'architecture'):
                        field_value = getattr(system_instance.architecture, field_name, None)
                    else:
                        field_value = None
                # Tab 4: Some fields are in SystemDataInfo model
                elif tab_key == 'tab4' and field_name in ['storage_size_gb', 'file_storage_size_gb', 'growth_rate_percent', 'file_storage_type', 'record_count', 'secondary_databases', 'data_types']:
                    if hasattr(system_instance, 'data_info'):
                        field_value = getattr(system_instance.data_info, field_name, None)
                    else:
                        field_value = None
                # Tab 8: support_level is in SystemOperations model
                elif tab_key == 'tab8' and field_name == 'support_level':
                    if hasattr(system_instance, 'operations'):
                        field_value = getattr(system_instance.operations, 'support_level', None)
                    else:
                        field_value = None
                # Tab 9: All fields are in SystemAssessment model
                elif tab_key == 'tab9':
                    if hasattr(system_instance, 'assessment'):
                        field_value = getattr(system_instance.assessment, field_name, None)
                    else:
                        field_value = None
                else:
                    field_value = getattr(system_instance, field_name, None)

                if is_field_filled(field_value):
                    filled_fields += 1
            except AttributeError:
                # Field doesn't exist on the model, skip it
                continue

    # Count conditional fields (only if condition is met)
    for field_name, condition_field in CONDITIONAL_FIELDS_MAP.items():
        try:
            # Special handling for cloud_provider (architecture model field)
            if field_name == 'cloud_provider':
                # cloud_provider is required when hosting_type = 'cloud'
                if hasattr(system_instance, 'architecture'):
                    hosting_type = getattr(system_instance.architecture, 'hosting_type', None)
                    if hosting_type == 'cloud':
                        total_required_fields += 1
                        field_value = getattr(system_instance.architecture, 'cloud_provider', None)
                        if is_field_filled(field_value):
                            filled_fields += 1
                continue

            # Check if condition is met (boolean check for other fields)
            condition_value = getattr(system_instance, condition_field, False)

            if condition_value is True:
                # Condition met, this field is now required
                total_required_fields += 1

                field_value = getattr(system_instance, field_name, None)
                if is_field_filled(field_value):
                    filled_fields += 1
        except AttributeError:
            # Field doesn't exist, skip it
            continue

    # Special handling for is_go_live and go_live_date
    # - If is_go_live is None: Don't count either field
    # - If is_go_live is not None: Count both fields (is_go_live filled, check go_live_date)
    try:
        is_go_live_value = getattr(system_instance, 'is_go_live', None)
        if is_go_live_value is not None:
            # is_go_live has been set (True or False), count both fields
            total_required_fields += 2  # is_go_live and go_live_date
            filled_fields += 1  # is_go_live is filled (not None)

            # Check if go_live_date is filled
            go_live_date_value = getattr(system_instance, 'go_live_date', None)
            if is_field_filled(go_live_date_value):
                filled_fields += 1
    except AttributeError:
        pass

    # Avoid division by zero
    if total_required_fields == 0:
        return 100.0  # If no required fields, consider it 100% complete

    # Calculate percentage
    percentage = (filled_fields / total_required_fields) * 100.0

    # Round to 1 decimal place
    return round(percentage, 1)


def get_incomplete_fields(system_instance: Any) -> List[str]:
    """
    Get list of incomplete required field names for a system.

    Args:
        system_instance: The System model instance

    Returns:
        list: List of field names that are required but not filled
    """
    if system_instance is None:
        return []

    incomplete = []

    # Check always-required fields
    for tab_key, field_names in REQUIRED_FIELDS_MAP.items():
        for field_name in field_names:
            try:
                # Tab 3: Some fields are in SystemArchitecture model
                if tab_key == 'tab3' and field_name in ['architecture_type', 'architecture_description', 'backend_tech', 'frontend_tech', 'mobile_app', 'database_type', 'database_model', 'hosting_type']:
                    if hasattr(system_instance, 'architecture'):
                        field_value = getattr(system_instance.architecture, field_name, None)
                    else:
                        field_value = None
                # Tab 4: Some fields are in SystemDataInfo model
                elif tab_key == 'tab4' and field_name in ['storage_size_gb', 'file_storage_size_gb', 'growth_rate_percent', 'file_storage_type', 'record_count', 'secondary_databases', 'data_types']:
                    if hasattr(system_instance, 'data_info'):
                        field_value = getattr(system_instance.data_info, field_name, None)
                    else:
                        field_value = None
                # Tab 8: support_level is in SystemOperations model
                elif tab_key == 'tab8' and field_name == 'support_level':
                    if hasattr(system_instance, 'operations'):
                        field_value = getattr(system_instance.operations, 'support_level', None)
                    else:
                        field_value = None
                # Tab 9: All fields are in SystemAssessment model
                elif tab_key == 'tab9':
                    if hasattr(system_instance, 'assessment'):
                        field_value = getattr(system_instance.assessment, field_name, None)
                    else:
                        field_value = None
                else:
                    field_value = getattr(system_instance, field_name, None)

                if not is_field_filled(field_value):
                    incomplete.append(field_name)
            except AttributeError:
                continue

    # Check conditional fields
    for field_name, condition_field in CONDITIONAL_FIELDS_MAP.items():
        try:
            # Special handling for cloud_provider (architecture model field)
            if field_name == 'cloud_provider':
                if hasattr(system_instance, 'architecture'):
                    hosting_type = getattr(system_instance.architecture, 'hosting_type', None)
                    if hosting_type == 'cloud':
                        field_value = getattr(system_instance.architecture, 'cloud_provider', None)
                        if not is_field_filled(field_value):
                            incomplete.append(field_name)
                continue

            condition_value = getattr(system_instance, condition_field, False)
            if condition_value is True:
                field_value = getattr(system_instance, field_name, None)
                if not is_field_filled(field_value):
                    incomplete.append(field_name)
        except AttributeError:
            continue

    # Special handling for is_go_live and go_live_date
    # - If is_go_live is None: Don't report either field as incomplete
    # - If is_go_live is not None: go_live_date is required
    try:
        is_go_live_value = getattr(system_instance, 'is_go_live', None)
        if is_go_live_value is not None:
            # is_go_live has been set, check if go_live_date is filled
            go_live_date_value = getattr(system_instance, 'go_live_date', None)
            if not is_field_filled(go_live_date_value):
                incomplete.append('go_live_date')
    except AttributeError:
        pass

    return incomplete


def get_tab_completion_status(system_instance: Any) -> Dict[str, Dict[str, Any]]:
    """
    Get completion status for each tab.

    Args:
        system_instance: The System model instance

    Returns:
        dict: Dictionary with tab keys and their completion info
              {
                  'tab1': {'required': 5, 'filled': 3, 'percentage': 60.0, 'complete': False},
                  'tab2': {...},
                  ...
              }
    """
    if system_instance is None:
        return {}

    tab_status = {}

    for tab_key, field_names in REQUIRED_FIELDS_MAP.items():
        total_required = len(field_names)
        filled_count = 0

        for field_name in field_names:
            try:
                # Tab 3: Some fields are in SystemArchitecture model
                if tab_key == 'tab3' and field_name in ['architecture_type', 'architecture_description', 'backend_tech', 'frontend_tech', 'mobile_app', 'database_type', 'database_model', 'hosting_type']:
                    if hasattr(system_instance, 'architecture'):
                        field_value = getattr(system_instance.architecture, field_name, None)
                    else:
                        field_value = None
                # Tab 4: Some fields are in SystemDataInfo model
                elif tab_key == 'tab4' and field_name in ['storage_size_gb', 'file_storage_size_gb', 'growth_rate_percent', 'file_storage_type', 'record_count', 'secondary_databases', 'data_types']:
                    if hasattr(system_instance, 'data_info'):
                        field_value = getattr(system_instance.data_info, field_name, None)
                    else:
                        field_value = None
                # Tab 8: support_level is in SystemOperations model
                elif tab_key == 'tab8' and field_name == 'support_level':
                    if hasattr(system_instance, 'operations'):
                        field_value = getattr(system_instance.operations, 'support_level', None)
                    else:
                        field_value = None
                # Tab 9: All fields are in SystemAssessment model
                elif tab_key == 'tab9':
                    if hasattr(system_instance, 'assessment'):
                        field_value = getattr(system_instance.assessment, field_name, None)
                    else:
                        field_value = None
                else:
                    field_value = getattr(system_instance, field_name, None)

                if is_field_filled(field_value):
                    filled_count += 1
            except AttributeError:
                continue

        # Special handling for tab1: is_go_live and go_live_date
        if tab_key == 'tab1':
            try:
                is_go_live_value = getattr(system_instance, 'is_go_live', None)
                if is_go_live_value is not None:
                    # is_go_live has been set, count both fields
                    total_required += 2  # is_go_live and go_live_date
                    filled_count += 1  # is_go_live is filled (not None)

                    # Check if go_live_date is filled
                    go_live_date_value = getattr(system_instance, 'go_live_date', None)
                    if is_field_filled(go_live_date_value):
                        filled_count += 1
            except AttributeError:
                pass

        # Calculate percentage for this tab
        if total_required == 0:
            tab_percentage = 100.0
        else:
            tab_percentage = (filled_count / total_required) * 100.0

        tab_status[tab_key] = {
            'required': total_required,
            'filled': filled_count,
            'percentage': round(tab_percentage, 1),
            'complete': filled_count == total_required and total_required > 0
        }

    return tab_status
