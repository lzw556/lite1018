import { Checkbox, Col, Row, Select, Space, Table } from 'antd';
import EChartsReact from 'echarts-for-react';
import dayjs from '../../../../utils/dayjsUtils';
import * as React from 'react';
import { useCallback, useState } from 'react';
import { LineChartStyles } from '../../../../constants/chart';
import { EmptyLayout } from '../../../layout';
import { Device } from '../../../../types/device';
import {
  DownloadDeviceDataByTimestampRequest,
  FindDeviceDataRequest,
  GetDeviceDataRequest
} from '../../../../apis/device';
import { isMobile } from '../../../../utils/deviceDetection';
import { DownloadOutlined } from '@ant-design/icons';
import usePermission, { Permission } from '../../../../permission/permission';
import { DeviceType } from '../../../../types/device_type';
import intl from 'react-intl-universal';
import { RangeDatePicker } from '../../../../components/rangeDatePicker';
import { useLocaleContext } from '../../../../localeProvider';

const { Option } = Select;

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

const WaveDataChart: React.FC<{ device: Device }> = ({ device }) => {
  const { language } = useLocaleContext();
  const [range, setRange] = React.useState<[number, number]>();
  const [dataSource, setDataSource] = React.useState<any>();
  const [deviceData, setDeviceData] = React.useState<any>();
  const [calculate, setCalculate] = React.useState<string>('accelerationTimeDomain');
  const [dimension, setDimension] = React.useState<number>(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isShowEnvelope, setIsShowEnvelope] = React.useState(false);
  const [dataType] = useState(
    device.typeId === DeviceType.VibrationTemperature3AxisAdvanced ? 16842758 : 16842753
  );
  const { hasPermission } = usePermission();

  const fetchDeviceDataByTimestamp = useCallback(
    (timestamp: number) => {
      setIsLoading(true);
      GetDeviceDataRequest(device.id, timestamp, { calculate, dimension, data_type: dataType })
        .then((data) => {
          setIsLoading(false);
          setDeviceData(data);
        })
        .catch((e) => {
          setIsLoading(false);
        });
    },
    [calculate, dimension, dataType, device.id]
  );

  const fetchDeviceWaveDataTimestamps = useCallback(() => {
    if (range) {
      const [from, to] = range;
      FindDeviceDataRequest(device.id, from, to, {
        data_type: dataType
      }).then((data) => {
        setDataSource(data);
        if (data.length > 0) {
          fetchDeviceDataByTimestamp(data[0].timestamp);
        }
      });
    }
  }, [range, device.id, dataType, fetchDeviceDataByTimestamp]);

  React.useEffect(() => {
    fetchDeviceWaveDataTimestamps();
  }, [fetchDeviceWaveDataTimestamps]);

  React.useEffect(() => {
    if (deviceData) {
      fetchDeviceDataByTimestamp(deviceData.timestamp);
    }
  }, [fetchDeviceDataByTimestamp, deviceData]);

  const getChartTitle = () => {
    switch (calculate) {
      case 'accelerationTimeDomain':
        return `${intl.get('FIELD_ACCELERATION_TIME_DOMAIN')}(m/s²)`;
      case 'accelerationFrequencyDomain':
        return `${intl.get('FIELD_ACCELERATION_FREQUENCY_DOMAIN')}(m/s²)`;
      case 'velocityTimeDomain':
        return `${intl.get('FIELD_VELOCITY_TIME_DOMAIN')}(mm/s)`;
      case 'velocityFrequencyDomain':
        return `${intl.get('FIELD_VELOCITY_FREQUENCY_DOMAIN')}(mm/s)`;
      case 'displacementTimeDomain':
        return `${intl.get('FIELD_DISPLACEMENT_TIME_DOMAIN')}(μm)`;
      case 'displacementFrequencyDomain':
        return `${intl.get('FIELD_DISPLACEMENT_FREQUENCY_DOMAIN')}(μm)`;
    }
    return '';
  };

  const columns = [
    {
      title: intl.get('TIMESTAMP'),
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: '80%',
      render: (timestamp: number) => dayjs.unix(timestamp).local().format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: intl.get('OPERATION'),
      key: 'action',
      render: (text: any, record: any) => {
        if (hasPermission(Permission.DeviceRawDataDownload)) {
          return (
            <Space size='middle'>
              <a onClick={() => onDownload(record.timestamp)}>{intl.get('DOWNLOAD')}</a>
            </Space>
          );
        }
      }
    }
  ];
  const onDownload = (timestamp: number) => {
    DownloadDeviceDataByTimestampRequest(
      device.id,
      timestamp,
      {
        calculate,
        data_type: dataType
      },
      language === 'en-US' ? 'en' : 'zh'
    ).then((res) => {
      if (res.status === 200) {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
          'download',
          `${dayjs.unix(timestamp).local().format('YYYY-MM-DD_hh-mm-ss')}${getChartTitle()}.csv`
        );
        document.body.appendChild(link);
        link.click();
      }
    });
  };

  const renderChart = () => {
    if (deviceData === undefined && !isLoading) {
      return <EmptyLayout description={intl.get('LOADING')} />;
    } else {
      let option: any = { ...defaultChartOption };
      if (deviceData) {
        const data = deviceData.values;
        const legends = [intl.get('AXIS_X'), intl.get('AXIS_Y'), intl.get('AXIS_Z')];
        let series: any[] = [
          {
            name: legends[dimension],
            type: 'line',
            data: data.values,
            itemStyle: LineChartStyles[dimension].itemStyle,
            showSymbol: false
          }
        ];
        if (isShowEnvelope) {
          series = [
            {
              name: legends[dimension],
              type: 'line',
              data: data.highEnvelopes,
              lineStyle: {
                opacity: 0
              },
              areaStyle: {
                color: '#ccc'
              },
              stack: 'confidence-band',
              symbol: 'none'
            },
            {
              name: legends[dimension],
              type: 'line',
              data: data.lowEnvelopes,
              lineStyle: {
                opacity: 0
              },
              areaStyle: {
                color: '#ccc'
              },
              stack: 'confidence-band',
              symbol: 'none'
            },
            ...series
          ];
        }
        option = {
          ...defaultChartOption,
          legend: {
            data: [legends[dimension]],
            itemStyle: {
              color: LineChartStyles[dimension].itemStyle.color
            }
          },
          title: { text: `${getChartTitle()} ${data.frequency / 1000}KHz`, top: 0 },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              crossStyle: {
                color: '#999'
              }
            },
            formatter: `{b} ${data.xAxisUnit}<br/>${legends[dimension]}: {c}`
          },
          xAxis: {
            type: 'category',
            data: data.xAxis,
            name: data.xAxisUnit
          },
          series: series
        };
      }
      return (
        <EChartsReact
          loadingOption={{ text: intl.get('LOADING') }}
          showLoading={isLoading}
          style={{ height: 500 }}
          option={option}
          notMerge={true}
        />
      );
    }
  };

  const handleRangeChange = React.useCallback((range: [number, number]) => setRange(range), []);

  const select_fields = (
    <Select
      defaultValue={calculate}
      style={{ width: !isMobile ? '120px' : '100%' }}
      onChange={setCalculate}
    >
      <Option key={'accelerationTimeDomain'} value={'accelerationTimeDomain'}>
        {intl.get('FIELD_ACCELERATION_TIME_DOMAIN')}
      </Option>
      <Option key={'accelerationFrequencyDomain'} value={'accelerationFrequencyDomain'}>
        {intl.get('FIELD_ACCELERATION_FREQUENCY_DOMAIN')}
      </Option>
      <Option key={'velocityTimeDomain'} value={'velocityTimeDomain'}>
        {intl.get('FIELD_VELOCITY_TIME_DOMAIN')}
      </Option>
      <Option key={'velocityFrequencyDomain'} value={'velocityFrequencyDomain'}>
        {intl.get('FIELD_VELOCITY_FREQUENCY_DOMAIN')}
      </Option>
      <Option key={'displacementTimeDomain'} value={'displacementTimeDomain'}>
        {intl.get('FIELD_DISPLACEMENT_TIME_DOMAIN')}
      </Option>
      <Option key={'displacementFrequencyDomain'} value={'displacementFrequencyDomain'}>
        {intl.get('FIELD_DISPLACEMENT_FREQUENCY_DOMAIN')}
      </Option>
    </Select>
  );
  const select_axis = (
    <Select
      style={{ width: !isMobile ? '120px' : '100%' }}
      defaultValue={dimension}
      onChange={(value) => {
        setDimension(value);
      }}
    >
      <Option key={0} value={0}>
        {intl.get('AXIS_X')}
      </Option>
      <Option key={1} value={1}>
        {intl.get('AXIS_Y')}
      </Option>
      <Option key={2} value={2}>
        {intl.get('AXIS_Z')}
      </Option>
    </Select>
  );
  if (isMobile) {
    if (!deviceData?.timestamp) {
      return <EmptyLayout description={intl.get('NO_WAVEFORM_PROMPT')} />;
    }

    return (
      <>
        <Row style={{ marginBottom: 8 }}>
          <Col span={24}>
            <RangeDatePicker onChange={handleRangeChange} />
          </Col>
        </Row>
        <Row style={{ marginBottom: 8 }} align='middle'>
          <Col span={14}>
            <Select
              style={{ width: '100%' }}
              defaultValue={deviceData?.timestamp}
              onChange={(value) => {
                if (value !== deviceData?.timestamp) {
                  fetchDeviceDataByTimestamp(value);
                }
              }}
            >
              {dataSource.map((item: any) => (
                <Option key={item.timestamp} value={item.timestamp}>
                  {dayjs.unix(item.timestamp).local().format('YYYY-MM-DD HH:mm:ss')}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={7} offset={1}>
            {calculate.indexOf('TimeDomain') !== -1 && (
              <Checkbox
                defaultChecked={isShowEnvelope}
                onChange={(e) => {
                  setIsShowEnvelope(e.target.checked);
                }}
              >
                {intl.get('SHOW_ENVELOPE')}
              </Checkbox>
            )}
          </Col>
          <Col span={2}>
            <DownloadOutlined onClick={() => onDownload(deviceData?.timestamp)} />
          </Col>
        </Row>
        <Row justify='space-between' style={{ marginBottom: 16 }}>
          <Col span={11}>{select_fields}</Col>
          <Col span={11}>{select_axis}</Col>
        </Row>
        <Row>
          <Col span={24}>{renderChart()}</Col>
        </Row>
      </>
    );
  } else {
    return (
      <Row>
        <Col xl={6} xxl={4} style={{ maxHeight: 500 }}>
          <Row justify={'center'} style={{ width: '100%' }}>
            <Col span={24}>
              <RangeDatePicker onChange={handleRangeChange} />
            </Col>
          </Row>
          <Row justify={'space-between'} style={{ paddingTop: '0px' }}>
            <Col span={24}>
              <Table
                size={'middle'}
                scroll={{ y: 500 }}
                showHeader={false}
                columns={columns}
                pagination={false}
                dataSource={dataSource}
                rowClassName={(record) =>
                  record.timestamp === deviceData?.timestamp ? 'ant-table-row-selected' : ''
                }
                onRow={(record) => ({
                  onClick: () => {
                    if (record.timestamp !== deviceData?.timestamp) {
                      fetchDeviceDataByTimestamp(record.timestamp);
                    }
                  },
                  onMouseLeave: () => (window.document.body.style.cursor = 'default'),
                  onMouseEnter: () => (window.document.body.style.cursor = 'pointer')
                })}
              />
            </Col>
          </Row>
        </Col>
        <Col xl={18} xxl={20}>
          <Row justify={'start'}>
            <Col span={24}>
              <Row justify={'end'}>
                <Col>
                  <Space wrap={true}>
                    {calculate.indexOf('TimeDomain') !== -1 && (
                      <Checkbox
                        defaultChecked={isShowEnvelope}
                        onChange={(e) => {
                          setIsShowEnvelope(e.target.checked);
                        }}
                      >
                        {intl.get('SHOW_ENVELOPE')}
                      </Checkbox>
                    )}
                    {select_fields}
                    {select_axis}
                  </Space>
                </Col>
              </Row>
            </Col>
            <Col span={24}>{renderChart()}</Col>
          </Row>
        </Col>
      </Row>
    );
  }
};

export default WaveDataChart;
