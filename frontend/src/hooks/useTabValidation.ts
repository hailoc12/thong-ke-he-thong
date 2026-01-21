/**
 * Custom Hook: useTabValidation
 *
 * Provides tab validation logic for SystemCreate and SystemEdit forms.
 * Blocks tab navigation when current tab has validation errors.
 *
 * Features:
 * - Validates current tab before allowing navigation
 * - Allows backward navigation without validation
 * - Tracks validation status per tab
 * - Shows user-friendly error messages
 *
 * Usage:
 * ```typescript
 * const { handleTabChange, tabValidationStatus, validateCurrentTab } = useTabValidation({
 *   form,
 *   currentTab: '1',
 *   onTabChange: (newTab) => setCurrentTab(newTab),
 * });
 * ```
 */

import { useState, useCallback } from 'react';
import { type FormInstance, message } from 'antd';
import { validateTab, TabDisplayNames } from '../utils/systemValidationRules';

export interface UseTabValidationProps {
  /**
   * Ant Design form instance
   */
  form: FormInstance;

  /**
   * Current active tab key (e.g., '1', '2', ...)
   */
  currentTab: string;

  /**
   * Callback function to execute when tab navigation is allowed
   */
  onTabChange: (newTabKey: string) => void;
}

export interface UseTabValidationReturn {
  /**
   * Handler for tab change events
   * Validates current tab before allowing navigation
   */
  handleTabChange: (newTabKey: string) => void;

  /**
   * Validation status for each tab
   * Record<tabKey, isValid>
   */
  tabValidationStatus: Record<string, boolean>;

  /**
   * Manually validate the current tab
   * Returns true if valid, false otherwise
   */
  validateCurrentTab: () => Promise<boolean>;

  /**
   * Clear validation status for a specific tab
   */
  clearTabValidation: (tabKey: string) => void;

  /**
   * Reset all tab validation status
   */
  resetAllValidation: () => void;
}

/**
 * Custom hook for managing tab validation in multi-tab forms
 */
export const useTabValidation = ({
  form,
  currentTab,
  onTabChange,
}: UseTabValidationProps): UseTabValidationReturn => {
  // Track validation status for each tab
  const [tabValidationStatus, setTabValidationStatus] = useState<Record<string, boolean>>({});

  /**
   * Handle tab change with validation
   * - Forward navigation: Validate current tab first
   * - Backward navigation: Allow without validation
   */
  const handleTabChange = useCallback(
    async (newTabKey: string) => {
      const currentTabNum = parseInt(currentTab, 10);
      const newTabNum = parseInt(newTabKey, 10);

      // Allow backward navigation without validation
      if (newTabNum < currentTabNum) {
        onTabChange(newTabKey);
        return;
      }

      // Validate current tab for forward navigation
      const validation = await validateTab(form, currentTab);

      if (!validation.isValid) {
        // Show error notification with field count
        const tabName = TabDisplayNames[currentTab] || `Tab ${currentTab}`;
        const errorCount = validation.errorCount;
        const fieldText = errorCount === 1 ? 'trường' : 'trường';

        message.error({
          content: `Vui lòng điền đủ ${errorCount} ${fieldText} bắt buộc trong tab "${tabName}" trước khi chuyển tab`,
          duration: 5,
        });

        // Scroll to first error field
        if (validation.errorFields.length > 0) {
          form.scrollToField(validation.errorFields[0], {
            behavior: 'smooth',
            block: 'center',
          });
        }

        // Update validation status to show error
        setTabValidationStatus(prev => ({
          ...prev,
          [currentTab]: false,
        }));

        return; // Block navigation
      }

      // Validation passed - update status and allow navigation
      setTabValidationStatus(prev => ({
        ...prev,
        [currentTab]: true,
      }));

      onTabChange(newTabKey);
    },
    [form, currentTab, onTabChange]
  );

  /**
   * Validate current tab without changing tabs
   * Useful for manual validation triggers
   */
  const validateCurrentTab = useCallback(async () => {
    const validation = await validateTab(form, currentTab);

    setTabValidationStatus(prev => ({
      ...prev,
      [currentTab]: validation.isValid,
    }));

    return validation.isValid;
  }, [form, currentTab]);

  /**
   * Clear validation status for a specific tab
   */
  const clearTabValidation = useCallback((tabKey: string) => {
    setTabValidationStatus(prev => {
      const newStatus = { ...prev };
      delete newStatus[tabKey];
      return newStatus;
    });
  }, []);

  /**
   * Reset all tab validation status
   */
  const resetAllValidation = useCallback(() => {
    setTabValidationStatus({});
  }, []);

  return {
    handleTabChange,
    tabValidationStatus,
    validateCurrentTab,
    clearTabValidation,
    resetAllValidation,
  };
};
