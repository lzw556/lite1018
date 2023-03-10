import { Col, Empty, Row, Spin } from 'antd';
import dayjs from '../../../../../utils/dayjsUtils';
import * as React from 'react';
import { isMobile } from '../../../../../utils/deviceDetection';
import { generateChartOptionsOfHistoryDatas } from '../../../common/historyDataHelper';
import { ChartContainer } from '../../../components/charts/chartContainer';
import { MeasurementRow } from '../props';
import { getData } from '../services';

export const Monitor: React.FC<MeasurementRow> = (props) => {
  const { id, type } = props;
  const [loading, setLoading] = React.useState(true);
  const [historyOptions, setHistoryOptions] = React.useState<any>();
  React.useEffect(() => {
    const from = dayjs().startOf('day').subtract(7, 'd').utc().unix();
    const to = dayjs().endOf('day').utc().unix();
    getData(id, from, to).then((data) => {
      setLoading(false);
      if (data.length > 0) setHistoryOptions(generateChartOptionsOfHistoryDatas(data, type));
    });
  }, [id, type]);

  if (loading) return <Spin />;
  if (!historyOptions || historyOptions.length === 0)
    return <Empty description='暂无数据' image={Empty.PRESENTED_IMAGE_SIMPLE} />;

  return (
    <Row gutter={[32, 32]}>
      {historyOptions.map((ops: any, index: number) => (
        <Col span={isMobile ? 24 : 6} key={index}>
          <ChartContainer title='' options={ops} />
        </Col>
      ))}
    </Row>
  );
};
