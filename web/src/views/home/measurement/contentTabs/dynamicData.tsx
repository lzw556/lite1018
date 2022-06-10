import { Col, DatePicker, Row } from 'antd';
import moment from 'moment';
import * as React from 'react';
import { MeasurementRow } from '../props';
import { getData } from '../services';

export const DynamicData: React.FC<MeasurementRow> = (props) => {
  const [range, setRange] = React.useState<[moment.Moment, moment.Moment]>([
    moment().subtract(7, 'days').startOf('day'),
    moment().endOf('day')
  ]);
  const [timestamps, setTimestamps] = React.useState<number[]>([]);
  const [timestamp, setTimestamp] = React.useState<number>();

  React.useEffect(() => {
    const [from, to] = range;
    getData(props.id, from.utc().unix(), to.utc().unix(), true);
  }, [range, props.id]);
  
  return (
    <Row gutter={[0, 16]}>
      <Col span={24}>
        <DatePicker.RangePicker
          allowClear={false}
          value={range}
          onChange={(date, dateString) => {
            if (dateString)
              setRange([moment(dateString[0]).startOf('day'), moment(dateString[1]).endOf('day')]);
          }}
        />
      </Col>
      <Col span={24}></Col>
    </Row>
  );
};
