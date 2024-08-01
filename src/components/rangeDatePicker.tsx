import { Button, DatePicker, Space } from 'antd';
import * as React from 'react';
import dayjs, { RangeValue } from '../utils/dayjsUtils';
import intl from 'react-intl-universal';

export const oneYearRange: RangeValue = [
  dayjs().startOf('day').subtract(1, 'y'),
  dayjs().endOf('day')
];

export const oneWeekRange: RangeValue = [
  dayjs().startOf('day').subtract(6, 'd'),
  dayjs().endOf('day')
];

export const oneWeekNumberRange: [number, number] = [
  oneWeekRange[0].utc().unix(),
  oneWeekRange[1].utc().unix()
];

export const oneYearNumberRange: [number, number] = [
  oneYearRange[0].utc().unix(),
  oneYearRange[1].utc().unix()
];

export const RangeDatePicker: React.FC<{
  defaultRange?: RangeValue;
  onChange?: (range: [number, number]) => void;
  showFooter?: boolean;
  value?: [number, number];
}> = ({ defaultRange = oneWeekRange, onChange, showFooter, value }) => {
  const [range, setRange] = React.useState<RangeValue>(defaultRange);
  const handleChange = (range: RangeValue) => {
    setRange(range);
    const [start, end] = range;
    if (start && end) {
      onChange?.([start.utc().unix(), end.endOf('day').utc().unix()]);
    }
  };

  return (
    <DatePicker.RangePicker
      allowClear={false}
      defaultValue={defaultRange}
      value={value ? [dayjs.unix(value[0]), dayjs.unix(value[1])] : range}
      renderExtraFooter={() => {
        const calculateRange = (months: number): RangeValue => {
          return [dayjs().startOf('day').subtract(months, 'months'), dayjs().endOf('day')];
        };
        return (
          showFooter && (
            <Space>
              <Button type='text' onClick={() => handleChange(calculateRange(1))}>
                {intl.get('OPTION_LAST_MONTH')}
              </Button>
              <Button type='text' onClick={() => handleChange(calculateRange(3))}>
                {intl.get('OPTION_LAST_3_MONTHS')}
              </Button>
              <Button type='text' onClick={() => handleChange(calculateRange(6))}>
                {intl.get('OPTION_LAST_HALF_YEAR')}
              </Button>
              <Button type='text' onClick={() => handleChange(calculateRange(12))}>
                {intl.get('OPTION_LAST_YEAR')}
              </Button>
            </Space>
          )
        );
      }}
      onChange={(date) => {
        if (date) {
          handleChange(date as RangeValue);
        }
      }}
      disabledDate={(current) => current && current > dayjs().endOf('day')}
    />
  );
};
