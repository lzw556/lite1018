import { Col, DatePicker, Menu, Row } from 'antd';
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
  const [timestamp, setTimestamp] = React.useState(0);
  React.useEffect(() => {
    setTimestamp(timestamps.length > 0 ? timestamps[0] : 0);
  }, [timestamps]);
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

  const chartInstance = React.useRef();
  const handleChartReady = (echarts: any, id: number, timestamp: number) => {
    if (!chartInstance.current) chartInstance.current = echarts;
    echarts.showLoading();
    GetMeasurementRawDataRequest(id, timestamp).then((res) => {
      const legends = ['X轴', 'Y轴', 'Z轴'];
      const index = [];
      for (let i = 0; i < res.values.length / 3; i++) {
        index.push(i);
      }
      echarts.setOption({
        legend: { data: legends },
        xAxis: { type: 'category', data: index },
        yAxis: { type: 'value' },
        series: legends.map((legend, i) => ({
          name: legend,
          type: 'line',
          data: res.values.filter((val: number, j: number) => (j - i) % legends.length === 0),
          ...LineChartStyles.map((style) => style.itemStyle)[i]
        })),
        animation: false,
        smooth: true,
        dataZoom: [
          {
            type: 'slider',
            show: true,
            startValue: 0,
            endValue: 5000,
            height: '30',
            zoomLock: true
          }
        ]
      });
      echarts.hideLoading();
    });
  };
  const renderContent = () => {
    if (timestamps.length > 0 && timestamp > 0) {
      return (
        <Row>
          <Col span={4} style={{ maxHeight: 500, overflow: 'auto' }}>
            <Menu defaultSelectedKeys={[timestamp.toString()]}>
              {timestamps.map((time) => (
                <Menu.Item
                  key={time}
                  onClick={() => {
                    handleChartReady(chartInstance.current, measurement.id, time);
                  }}
                >
                  {moment.unix(time).local().format('YYYY-MM-DD HH:mm:ss')}
                </Menu.Item>
              ))}
            </Menu>
          </Col>
          <Col span={20}>
            <EChartsReact
              loadingOption={{ text: '正在处理数据, 请稍等...' }}
              showLoading={true}
              onChartReady={(echarts) => handleChartReady(echarts, measurement.id, timestamp)}
              option={{}}
            />
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
