import { useState, useEffect, useRef } from 'react';
import { Select, Input, Space } from 'antd';

const { TextArea } = Input;

interface SelectWithOtherProps {
  value?: string | null;
  onChange?: (value: string | null) => void;
  options: Array<{ label: string; value: string }>;
  otherValue?: string;
  placeholder?: string;
  customInputPlaceholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
}

export const SelectWithOther = ({
  value,
  onChange,
  options,
  otherValue = 'other',
  placeholder = 'Chọn hoặc nhập',
  customInputPlaceholder = 'Nhập thông tin khác...',
  disabled = false,
  allowClear = true,
}: SelectWithOtherProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [customValue, setCustomValue] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const customInputRef = useRef<any>(null);

  // Initialize from external value
  useEffect(() => {
    if (!value) {
      setSelectedOption(null);
      setCustomValue('');
      setShowCustomInput(false);
      return;
    }

    // Check if value is the "other" option itself (should show custom input with empty value)
    if (value === otherValue) {
      setSelectedOption(otherValue);
      setShowCustomInput(true);
      setCustomValue(''); // Empty initially, user will fill it
      return;
    }

    // Check if value is a predefined non-other option
    const isPredefined = options.some(opt => opt.value === value && opt.value !== otherValue);
    if (isPredefined) {
      setSelectedOption(value);
      setShowCustomInput(false);
      setCustomValue('');
    } else {
      // Value is custom text (not in predefined options)
      setSelectedOption(otherValue);
      setCustomValue(value);
      setShowCustomInput(true);
    }
  }, [value, options, otherValue]);

  // Handle select change
  const handleSelectChange = (selected: string | null) => {
    setSelectedOption(selected);

    if (selected === otherValue) {
      setShowCustomInput(true);
      // Focus custom input after render
      setTimeout(() => {
        customInputRef.current?.focus();
      }, 0);
      // Don't call onChange yet - wait for custom input
      if (!customValue) {
        onChange?.(null);
      }
    } else {
      setShowCustomInput(false);
      setCustomValue('');
      onChange?.(selected);
    }
  };

  // Handle custom input change
  const handleCustomInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCustomValue(val);
    onChange?.(val || null);
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Select
        value={selectedOption}
        onChange={handleSelectChange}
        placeholder={placeholder}
        disabled={disabled}
        allowClear={allowClear}
        style={{ width: '100%' }}
      >
        {options.map(opt => (
          <Select.Option key={opt.value} value={opt.value}>
            {opt.label}
          </Select.Option>
        ))}
      </Select>

      {showCustomInput && (
        <TextArea
          ref={customInputRef}
          value={customValue}
          onChange={handleCustomInputChange}
          placeholder={customInputPlaceholder}
          disabled={disabled}
          rows={2}
          autoSize={{ minRows: 2, maxRows: 4 }}
        />
      )}
    </Space>
  );
};

export default SelectWithOther;
