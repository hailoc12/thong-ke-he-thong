import { useState, useEffect, useRef } from 'react';
import { Checkbox, Input, Space, Row, Col } from 'antd';

type CheckboxValueType = string | number | boolean;

interface CheckboxGroupWithOtherProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  options: Array<{ label: string; value: string }>;
  otherValue?: string;
  customInputPlaceholder?: string;
  disabled?: boolean;
  columns?: number;
}

export const CheckboxGroupWithOther = ({
  value = [],
  onChange,
  options,
  otherValue = 'other',
  customInputPlaceholder = 'Nhập thông tin khác...',
  disabled = false,
  columns = 3,
}: CheckboxGroupWithOtherProps) => {
  const [checkedValues, setCheckedValues] = useState<CheckboxValueType[]>([]);
  const [customValue, setCustomValue] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const customInputRef = useRef<any>(null);

  // Initialize from external value
  useEffect(() => {
    if (!value || value.length === 0) {
      setCheckedValues([]);
      setCustomValue('');
      setShowCustomInput(false);
      return;
    }

    // Separate predefined values from custom text
    const predefinedOptionValues = options.map(opt => opt.value);
    const predefinedChecked: CheckboxValueType[] = [];
    let customText = '';

    value.forEach(val => {
      if (predefinedOptionValues.includes(val)) {
        predefinedChecked.push(val);
      } else {
        // This is custom text (not a predefined option)
        customText = val;
        // BUG FIX: When custom text exists, ensure "other" checkbox is checked
        if (!predefinedChecked.includes(otherValue)) {
          predefinedChecked.push(otherValue);
        }
      }
    });

    setCheckedValues(predefinedChecked);

    // If there's custom text or "other" is checked, show custom input
    if (customText || predefinedChecked.includes(otherValue)) {
      setShowCustomInput(true);
      setCustomValue(customText);
    } else {
      setShowCustomInput(false);
      setCustomValue('');
    }
  }, [value, options, otherValue]);

  // Handle checkbox group change
  const handleCheckboxChange = (checked: CheckboxValueType[]) => {
    setCheckedValues(checked);

    const hasOther = checked.includes(otherValue);
    setShowCustomInput(hasOther);

    if (hasOther) {
      // Focus custom input after render
      setTimeout(() => {
        customInputRef.current?.focus();
      }, 0);

      // Include custom value if it exists
      if (customValue) {
        const result = [...checked.filter(v => v !== otherValue), customValue];
        onChange?.(result as string[]);
      } else {
        // Just the predefined values (including "other")
        onChange?.(checked as string[]);
      }
    } else {
      // No "other" checked, clear custom value
      setCustomValue('');
      onChange?.(checked as string[]);
    }
  };

  // Handle custom input change
  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomValue(val);

    // Return predefined values (excluding "other") + custom text
    const predefinedValues = checkedValues.filter(v => v !== otherValue);
    if (val) {
      onChange?.([...predefinedValues, val] as string[]);
    } else {
      // Custom input is empty, just return predefined + "other" marker
      onChange?.([...predefinedValues, otherValue] as string[]);
    }
  };

  // Calculate span for each checkbox based on columns
  const span = 24 / columns;

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Checkbox.Group
        value={checkedValues}
        onChange={handleCheckboxChange}
        disabled={disabled}
        style={{ width: '100%' }}
      >
        <Row gutter={[8, 8]}>
          {options.map(opt => (
            <Col key={opt.value} span={span}>
              <Checkbox value={opt.value}>{opt.label}</Checkbox>
            </Col>
          ))}
        </Row>
      </Checkbox.Group>

      {showCustomInput && (
        <Input
          ref={customInputRef}
          value={customValue}
          onChange={handleCustomInputChange}
          placeholder={customInputPlaceholder}
          disabled={disabled}
          style={{ marginTop: 8 }}
        />
      )}
    </Space>
  );
};

export default CheckboxGroupWithOther;
