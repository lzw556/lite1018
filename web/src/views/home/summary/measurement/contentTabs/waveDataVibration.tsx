import { Col, Empty, Row, Select, Space, Spin, Table } from 'antd';
import moment from 'moment';
import * as React from 'react';
import { RangeDatePicker } from '../../../../../components/rangeDatePicker';
import { LineChartStyles } from '../../../../../constants/chart';
import { measurementTypes } from '../../../common/constants';
import { ChartContainer } from '../../../components/charts/chartContainer';
import { MeasurementRow } from '../props';
import { getData, getDynamicDataVibration } from '../services';

export const WaveDataVibration: React.FC<MeasurementRow> = (props) => {
  const [range, setRange] = React.useState<[number, number]>();
  const [loading, setLoading] = React.useState(false);
  const [timestamps, setTimestamps] = React.useState<{ timestamp: number }[]>([]);
  const [timestamp, setTimestamp] = React.useState<number>();
  const fields = measurementTypes.vibration.dynamicData?.fields;
  const [field, setField] = React.useState(
    fields && fields.length > 0 ? fields[0].value : undefined
  );
  const [axis, setAxis] = React.useState<number>(0);
  const [loading2, setLoading2] = React.useState(false);
  const [dynamicData, setDynamicData] = React.useState<any>();
  const [options, setOptions] = React.useState<any>();
  React.useEffect(() => {
    if (range) {
      const [from, to] = range;
      setLoading(true);
      getData(props.id, from, to, 'raw')
        .then((data) => setTimestamps(data))
        .finally(() => setLoading(false));
    }
  }, [props.id, range]);

  React.useEffect(() => {
    if (timestamps.length > 0) {
      setTimestamp(timestamps[0].timestamp);
    } else {
      setTimestamp(undefined);
    }
  }, [timestamps]);

  React.useEffect(() => {
    if (timestamp !== undefined && timestamp > 0 && field !== undefined) {
      setLoading2(true);
      getDynamicDataVibration(props.id, timestamp, 'raw', { field, axis })
        .then(setDynamicData)
        .finally(() => setLoading2(false));
    }
  }, [props.id, timestamp, field, axis]);

  React.useEffect(() => {
    if (dynamicData !== undefined) {
      const data = dynamicData.values;
      const legends = ['X轴', 'Y轴', 'Z轴'];
      let series: any[] = [
        {
          name: legends[axis],
          type: 'line',
          data: data.values,
          itemStyle: LineChartStyles[axis].itemStyle,
          showSymbol: false
        }
      ];
      const defaultChartOption = {
        title: { top: 0 },
        tooltip: {},
        xAxis: {},
        grid: {
          left: '2%',
          right: '8%',
          bottom: '12%',
          containLabel: true,
          borderWidth: '0'
        },
        yAxis: { type: 'value' },
        series: [],
        animation: false,
        smooth: true,
        dataZoom: [
          {
            type: 'slider',
            show: true,
            startValue: 0,
            endValue: 3000,
            height: '32',
            zoomLock: false
          }
        ]
      };
      const option = {
        ...defaultChartOption,
        legend: {
          data: [legends[axis]],
          itemStyle: {
            color: LineChartStyles[axis].itemStyle.normal.color
          }
        },
        title: {
          text: `${fields?.find(({ value }) => value === field)?.label} ${
            data.frequency / 1000
          }KHz`,
          top: 0
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: '#999'
            }
          },
          formatter: `{b} ${data.xAxisUnit}<br/>${legends[axis]}: {c}`
        },
        xAxis: {
          type: 'category',
          data: data.xAxis,
          name: data.xAxisUnit
        },
        series: series
      };
      setOptions(option);
      console.log(option);
    }
  }, [dynamicData, axis, field, fields]);

  const renderTimestampsList = () => {
    return (
      <Table
        size={'middle'}
        scroll={{ y: 600 }}
        showHeader={false}
        columns={[
          {
            title: '时间',
            dataIndex: 'timestamp',
            key: 'timestamp',
            width: '80%',
            render: (timestamp: number) =>
              moment.unix(timestamp).local().format('YYYY-MM-DD HH:mm:ss')
          }
        ]}
        pagination={false}
        dataSource={timestamps}
        rowClassName={(record) => (record.timestamp === timestamp ? 'ant-table-row-selected' : '')}
        onRow={(record) => ({
          onClick: () => {
            if (record.timestamp !== timestamp) {
              setTimestamp(record.timestamp);
            }
          },
          onMouseLeave: () => (window.document.body.style.cursor = 'default'),
          onMouseEnter: () => (window.document.body.style.cursor = 'pointer')
        })}
      />
    );
  };

  return (
    <Row gutter={[0, 16]}>
      <Col span={24}>
        <RangeDatePicker
          onChange={React.useCallback((range: [number, number]) => setRange(range), [])}
        />
      </Col>
      <Col span={24}>
        {loading && <Spin />}
        {!loading && (
          <Row>
            {timestamps.length === 0 && (
              <Col span={24}>
                <Empty description='暂无数据' image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </Col>
            )}
            {timestamps.length > 0 && <Col span={6}>{renderTimestampsList()}</Col>}
            {timestamp && (
              <Col span={18}>
                {loading2 && <Spin />}
                {!loading2 && dynamicData !== undefined && (
                  <>
                    <Row justify='space-between'>
                      <Col></Col>
                      <Col>
                        <Space>
                          <Select
                            style={{ width: 150 }}
                            defaultValue={field}
                            onChange={(value) => setField(value)}
                          >
                            {fields?.map(({ label, value }) => (
                              <Select.Option key={value} value={value}>
                                {label}
                              </Select.Option>
                            ))}
                          </Select>
                          <Select
                            style={{ width: 80 }}
                            defaultValue={0}
                            onChange={(value) => setAxis(value)}
                          >
                            {[
                              { label: 'X轴', value: 0 },
                              { label: 'Y轴', value: 1 },
                              { label: 'Z轴', value: 2 }
                            ].map(({ label, value }) => (
                              <Select.Option key={value} value={value}>
                                {label}
                              </Select.Option>
                            ))}
                          </Select>
                        </Space>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={24}>
                        <ChartContainer options={options} title='' style={{ height: '500px' }} />
                      </Col>
                    </Row>
                  </>
                )}
              </Col>
            )}
          </Row>
        )}
      </Col>
    </Row>
  );
};
