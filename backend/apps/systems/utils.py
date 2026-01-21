"""
Utility functions for the systems app.
"""
from typing import Dict, List, Any


# Define required fields per tab for completion percentage calculation
# These match the 25 required fields in frontend systemValidationRules.ts
REQUIRED_FIELDS_MAP: Dict[str, List[str]] = {
    'tab1': ['org', 'system_name', 'purpose', 'status', 'criticality_level', 'scope', 'system_group'],
    'tab2': ['business_objectives', 'business_processes', 'user_types'],
    'tab3': ['programming_language', 'framework', 'database_name', 'hosting_platform'],
    'tab4': ['data_sources', 'data_types', 'data_classification_type'],
    'tab5': [],  # No required fields
    'tab6': ['authentication_method'],
    'tab7': [],  # No required fields
    'tab8': ['business_owner', 'technical_owner'],
    'tab9': [],  # No required fields
}

# Conditional required fields - only count if condition is met
CONDITIONAL_FIELDS_MAP: Dict[str, Dict[str, str]] = {
    'cicd_tool': 'has_cicd',  # Required if has_cicd = True
    'automated_testing_tools': 'has_automated_testing',  # Required if has_automated_testing = True
    'layered_architecture_details': 'has_layered_architecture',  # Required if has_layered_architecture = True
    'data_catalog_notes': 'has_data_catalog',  # Required if has_data_catalog = True
    'mdm_notes': 'has_mdm',  # Required if has_mdm = True
}


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

    if isinstance(value, (int, float)):
        return True

    return False


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
                field_value = getattr(system_instance, field_name, None)

                if is_field_filled(field_value):
                    filled_fields += 1
            except AttributeError:
                # Field doesn't exist on the model, skip it
                continue

    # Count conditional fields (only if condition is met)
    for field_name, condition_field in CONDITIONAL_FIELDS_MAP.items():
        try:
            # Check if condition is met
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

    # Avoid division by zero
    if total_required_fields == 0:
        return 100.0  # If no required fields, consider it 100% complete

    # Calculate percentage
    percentage = (filled_fields / total_required_fields) * 100.0

    # Round to 1 decimal place
    return round(percentage, 1)


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
                field_value = getattr(system_instance, field_name, None)
                if is_field_filled(field_value):
                    filled_count += 1
            except AttributeError:
                continue

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
