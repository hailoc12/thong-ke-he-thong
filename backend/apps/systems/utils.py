"""
Utility functions for the systems app.
"""
from typing import Dict, List, Any


# Define required fields per tab for completion percentage calculation
REQUIRED_FIELDS_MAP: Dict[str, List[str]] = {
    'tab1': ['system_name', 'system_name_en', 'status', 'scope', 'system_group'],
    'tab2': ['business_objectives', 'user_types', 'annual_users'],
    'tab3': ['programming_language', 'framework', 'database_name', 'hosting_platform'],
    'tab4': ['data_classification_type', 'data_volume'],
    'tab5': ['integrated_internal_systems', 'data_exchange_method'],
    'tab6': ['authentication_method', 'has_encryption'],
    'tab7': ['has_support_team', 'support_level'],
    'tab8': [],  # Optional tab
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

    Args:
        system_instance: The System model instance to calculate completion for

    Returns:
        float: Completion percentage (0.0 to 100.0)
    """
    if system_instance is None:
        return 0.0

    total_required_fields = 0
    filled_fields = 0

    # Iterate through all tabs and their required fields
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
