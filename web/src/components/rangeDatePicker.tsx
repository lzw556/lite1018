import { Button, DatePicker, Space } from 'antd';
import moment from 'moment';
import * as React from 'react';

export type RangeValue = [moment.Moment, moment.Moment];
export const RangeDatePicker: React.FC<{
  defaultRange?: RangeValue;
  onChange?: (range: [number, number]) => void;
  showFooter?: boolean;
}> = ({ defaultRange = [moment().subtract(7, 'd'), moment()], onChange, showFooter }) => {
  const [range, setRange] = React.useState<RangeValue>(defaultRange);

  React.useEffect(() => {
    if (range && onChange) {
      onChange([
        moment(range[0]).startOf('day').utc().unix(),
        moment(range[1].endOf('day')).utc().unix()
      ]);
    }
  }, [range, onChange]);

  return (
    <DatePicker.RangePicker
      allowClear={false}
      defaultValue={defaultRange}
      value={range}
      renderExtraFooter={() => {
        const calculateRange = (months: number): [moment.Moment, moment.Moment] => {
          return [moment().startOf('day').subtract(months, 'months'), moment().endOf('day')];
        };
        return (
          showFooter && (
            <Space>
              <Button type='text' onClick={() => setRange(calculateRange(1))}>
                最近一个月
              </Button>
              <Button type='text' onClick={() => setRange(calculateRange(3))}>
                最近三个月
              </Button>
              <Button type='text' onClick={() => setRange(calculateRange(6))}>
                最近半年
              </Button>
              <Button type='text' onClick={() => setRange(calculateRange(12))}>
                最近一年
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
    />
  );
};
