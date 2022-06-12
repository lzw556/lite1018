import { Col, Empty, Row, Spin } from 'antd';
import moment from 'moment';
import * as React from 'react';
import { generateChartOptionsOfHistoryDatas } from '../../common/historyDataHelper';
import { ChartContainer } from '../../components/charts/chartContainer';
import { MeasurementRow } from '../props';
import { getData } from '../services';

export const Monitor: React.FC<MeasurementRow> = (props) => {
  const { id } = props;
  const [loading, setLoading] = React.useState(true);
  const [historyOptions, setHistoryOptions] = React.useState<any>();
  React.useEffect(() => {
    const from = moment().startOf('day').subtract(7, 'd').utc().unix();
    const to = moment().endOf('day').utc().unix();
    getData(id, from, to).then((data) => {
      setLoading(false)
      if (data.length > 0) setHistoryOptions(generateChartOptionsOfHistoryDatas(data));
    });
  }, [id]);

  if (loading) return <Spin />;
  if (!historyOptions || historyOptions.length === 0) return <Empty description='暂无数据' />;

  return (
    <Row gutter={[32, 32]}>
      {historyOptions.map((ops: any, index: number) => (
        <Col span={6} key={index}>
          <ChartContainer title='' options={ops} />
        </Col>
      ))}
    </Row>
  );
};
