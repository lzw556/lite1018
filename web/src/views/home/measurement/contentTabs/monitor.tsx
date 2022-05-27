import { Col, Row } from 'antd';
import moment from 'moment';
import * as React from 'react';
import { ChartContainer } from '../../charts/chartContainer';
import { generateMeasurementHistoryDataOptions } from '../../utils';
import { MeasurementRow } from '../props';
import { getData } from '../services';

export const Monitor: React.FC<MeasurementRow> = (props) => {
  const { id } = props;
  const [historyOptions, setHistoryOptions] = React.useState<any>();
  React.useEffect(() => {
    const from = moment().startOf('day').subtract(7, 'd').utc().unix();
    const to = moment().endOf('day').utc().unix();
    getData(id, from, to).then((data) => {
      if (data.length > 0) setHistoryOptions(generateMeasurementHistoryDataOptions(data));
    });
  }, [id]);

  if (!historyOptions || historyOptions.length === 0) return null;

  return (
    <Row gutter={[32, 16]}>
      {historyOptions.map((ops: any, index: number) => (
        <Col span={6} key={index}>
          <ChartContainer title='' options={ops} />
        </Col>
      ))}
    </Row>
  );
};
