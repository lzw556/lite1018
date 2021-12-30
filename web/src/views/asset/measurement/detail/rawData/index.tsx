import { Col, DatePicker, Menu, Row, Space, Typography } from 'antd';
import EChartsReact from 'echarts-for-react';
import moment from 'moment';
import * as React from 'react';
import {
  GetMeasurementRawDataRequest,
  GetMeasurementRawDataTimestampRequest
} from '../../../../../apis/measurement';
import { LineChartStyles } from '../../../../../constants/chart';
import { Measurement } from '../../../../../types/measurement';
import { EmptyLayout } from '../../../../layout';

const MeasurementRawData: React.FC<{ measurement: Measurement }> = ({ measurement }) => {
  const [beginDate, setBeginDate] = React.useState(moment().subtract(7, 'days').startOf('day'));
  const [endDate, setEndDate] = React.useState(moment().endOf('day'));
  const [timestamps, setTimestamps] = React.useState<number[]>([]);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [chartOptions, setChartOptions] = React.useState<any>();
  const [timestamp, setTimestamp] = React.useState(0);
  React.useEffect(() => {
    setIsLoaded(false);
    GetMeasurementRawDataTimestampRequest(
      measurement.id,
      beginDate.utc().unix(),
      endDate.utc().unix()
    ).then((res) => {
      setIsLoaded(true);
      setTimestamps(res.map((val: any) => val.timestamp));
    });
  }, [beginDate, endDate, measurement.id]);
  React.useEffect(() => {
    setTimestamp(timestamps.length > 0 ? timestamps[0] : 0);
  }, [timestamps]);
  React.useEffect(() => {
    setLoading(true);
    GetMeasurementRawDataRequest(measurement.id, timestamp).then(
      ({ values }: { timestamp: number; values: number[] }) => {
        const legends = ['X轴', 'Y轴', 'Z轴'];
        setChartOptions({
          legend: { data: legends },
          xAxis: {
            type: 'category',
            data: Object.keys(values.filter((val, i) => i % 3 === 0)).map((val) => Number(val))
          },
          yAxis: { type: 'value' },
          series: legends.map((legend, i) => ({
            name: legend,
            type: 'line',
            data: values.filter((val, j) => (j - i) % legends.length === 0),
            itemStyle: LineChartStyles[i].itemStyle
          })),
          animation: false,
          smooth: true,
          dataZoom: [
            {
              type: 'slider',
              show: true,
              startValue: 0,
              endValue: 5000,
              height: '15',
              bottom: '3%',
              zoomLock: true
            }
          ]
        });
        setLoading(false);
      }
    );
  }, [timestamp, measurement.id]);
  const renderContent = () => {
    if (timestamps.length > 0 && timestamp > 0) {
      return (
        <Row>
          <Col span={4} style={{ maxHeight: 500, overflow: 'auto' }}>
            <Menu selectedKeys={[timestamp.toString()]}>
              {timestamps.map((time) => (
                <Menu.Item
                  key={time}
                  title={moment.unix(time).local().format('YYYY-MM-DD HH:mm:ss')}
                  onClick={() => {
                    setTimestamp(time);
                  }}
                >
                  <Space size={24}>
                    <Typography.Link>下载</Typography.Link>
                    {moment.unix(time).local().format('YYYY-MM-DD HH:mm:ss')}
                  </Space>
                </Menu.Item>
              ))}
            </Menu>
          </Col>
          <Col span={20}>
            {loading && (
              <div
                className='mask'
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  zIndex: 10
                }}
              >
                <div
                  className='spin'
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%,-50%)'
                  }}
                >
                  正在处理数据, 请稍等...
                </div>
              </div>
            )}
            <EChartsReact style={{ height: 500 }} option={chartOptions} />
          </Col>
        </Row>
      );
    } else if (isLoaded) {
      return <EmptyLayout description={'暂时没有数据'} />;
    }
  };

  return (
    <>
      <Row justify='end'>
        <DatePicker.RangePicker
          allowClear={false}
          value={[beginDate, endDate]}
          onChange={(date, dateString) => {
            if (dateString) {
              setBeginDate(moment(dateString[0]).startOf('day'));
              setEndDate(moment(dateString[1]).endOf('day'));
            }
          }}
        />
      </Row>
      {renderContent()}
    </>
  );
};

export default MeasurementRawData;
