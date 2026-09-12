import { forwardRef } from "react";

import { Button, DatePicker, Space } from "antd";

import dayjs from "dayjs";

const BusinessDatePicker = forwardRef(function BusinessDatePicker(
  {
    value,
    onChange,
    disabled = false,
    allowClear = false,
    showTodayShortcut = true,
    size = "middle",
    ...props
  },
  ref
) {
  const selectToday = () => {
    onChange?.(dayjs());
  };

  return (
    <Space.Compact>
      <DatePicker
        {...props}
        ref={ref}
        value={value}
        onChange={onChange}
        disabled={disabled}
        allowClear={allowClear}
        size={size}
        format="DD.MM.YYYY"
      />

      {showTodayShortcut && (
        <Button size={size} disabled={disabled} onClick={selectToday}>
          Сегодня
        </Button>
      )}
    </Space.Compact>
  );
});

export default BusinessDatePicker;
