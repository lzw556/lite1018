import { Button, DatePicker, Space } from 'antd';
import * as React from 'react';
import dayjs, { RangeValue } from '../utils/dayjsUtils';
import intl from 'react-intl-universal';

export const oneYearRange: RangeValue = [
  dayjs().startOf('day').subtract(1, 'y'),
  dayjs().endOf('day')
];

export const oneWeekRange: RangeValue = [
  dayjs().startOf('day').subtract(7, 'd'),
  dayjs().endOf('day')
];

export const oneWeekNumberRange: [number, number] = [
  oneWeekRange[0].utc().unix(),
  oneWeekRange[1].utc().unix()
];

export const RangeDatePicker: React.FC<{
  defaultRange?: RangeValue;
  onChange?: (range: [number, number]) => void;
  showFooter?: boolean;
}> = ({ defaultRange = oneWeekRange, onChange, showFooter }) => {
  const [range, setRange] = React.useState<RangeValue>(defaultRange);

  React.useEffect(() => {
    if (range && onChange) {
      onChange([
        dayjs(range[0]).startOf('day').utc().unix(),
        dayjs(range[1]).endOf('day').utc().unix()
      ]);
    }
  }, [range, onChange]);

  return (
    <DatePicker.RangePicker
      allowClear={false}
      defaultValue={defaultRange}
      value={range}
      renderExtraFooter={() => {
        const calculateRange = (months: number): RangeValue => {
          return [dayjs().startOf('day').subtract(months, 'months'), dayjs().endOf('day')];
        };
        return (
          showFooter && (
            <Space>
              <Button type='text' onClick={() => setRange(calculateRange(1))}>
                {intl.get('OPTION_LAST_MONTH')}
              </Button>
              <Button type='text' onClick={() => setRange(calculateRange(3))}>
                {intl.get('OPTION_LAST_3_MONTHS')}
              </Button>
              <Button type='text' onClick={() => setRange(calculateRange(6))}>
                {intl.get('OPTION_LAST_HALF_YEAR')}
              </Button>
              <Button type='text' onClick={() => setRange(calculateRange(12))}>
                {intl.get('OPTION_LAST_YEAR')}
              </Button>
            </Space>
          )
        );
      }}
      onChange={(date) => {
        if (date) {
          setRange(date as RangeValue);
        }
      }}
      disabledDate={(current) => current && current > dayjs().endOf('day')}
    />
  );
};
