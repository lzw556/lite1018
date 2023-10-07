import { Checkbox, Col, Empty, Row, Select, Space, Table } from 'antd';
import dayjs from '../../../../utils/dayjsUtils';
import * as React from 'react';
import { EmptyLayout } from '../../../layout';
import { Device } from '../../../../types/device';
import {
  DeviceWaveData,
  DownloadDeviceDataByTimestampRequest,
  FindDeviceDataRequest,
  GetDeviceDataRequest
} from '../../../../apis/device';
import { isMobile } from '../../../../utils/deviceDetection';
import { DownloadOutlined } from '@ant-design/icons';
import usePermission, { Permission } from '../../../../permission/permission';
import { SVT_DEVICE_TYPE_SENSOR_TYPE_MAPPING } from '../../../../types/device_type';
import intl from 'react-intl-universal';
import { RangeDatePicker, oneWeekNumberRange } from '../../../../components/rangeDatePicker';
import { useLocaleContext } from '../../../../localeProvider';
import { PropertyChart } from '../../../../components/charts/propertyChart';
import { getDisplayName } from '../../../../utils/format';

const { Option } = Select;

const WaveDataChart: React.FC<{ device: Device }> = ({ device }) => {
  const { language } = useLocaleContext();
  const [range, setRange] = React.useState<[number, number]>(oneWeekNumberRange);
  const [dataSource, setDataSource] = React.useState<any>();
  const [selectedTimestamp, setSelectedTimestamp] = React.useState<number>();
  const [deviceData, setDeviceData] = React.useState<DeviceWaveData>();
  const [calculate, setCalculate] = React.useState<string>('accelerationFrequencyDomain');
  const [dimension, setDimension] = React.useState<number>(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isShowEnvelope, setIsShowEnvelope] = React.useState(false);
  const dataType =
    SVT_DEVICE_TYPE_SENSOR_TYPE_MAPPING[
      device.typeId as keyof typeof SVT_DEVICE_TYPE_SENSOR_TYPE_MAPPING
    ];
  const { hasPermission } = usePermission();

  const fetchDeviceWaveDataTimestamps = (id: number, range: [number, number], dataType: number) => {
    if (range) {
      const [from, to] = range;
      FindDeviceDataRequest(id, from, to, {
        data_type: dataType
      }).then((data) => {
        setDataSource(data);
      });
    }
  };

  const fetchDeviceDataByTimestamp = (
    id: number,
    timestamp: number,
    dataType: number,
    dimension: number,
    calculate: any
  ) => {
    setIsLoading(true);
    GetDeviceDataRequest(id, timestamp, { calculate, dimension, data_type: dataType })
      .then((data) => {
        setIsLoading(false);
        setDeviceData(data);
      })
      .catch((e) => {
        setIsLoading(false);
      });
  };

  React.useEffect(() => {
    fetchDeviceWaveDataTimestamps(device.id, range, dataType);
  }, [device.id, range, dataType]);

  React.useEffect(() => {
    if (dataSource && dataSource.length > 0) {
      setSelectedTimestamp(dataSource[0].timestamp);
    }
  }, [dataSource]);

  React.useEffect(() => {
    if (selectedTimestamp) {
      fetchDeviceDataByTimestamp(device.id, selectedTimestamp, dataType, dimension, calculate);
    }
  }, [calculate, dimension, dataType, device.id, selectedTimestamp]);

  const getChartTitle = () => {
    switch (calculate) {
      case 'accelerationTimeDomain':
        return getDisplayName({
          name: intl.get('FIELD_ACCELERATION_TIME_DOMAIN'),
          suffix: 'm/s²',
          lang: language
        });
      case 'accelerationFrequencyDomain':
        return getDisplayName({
          name: intl.get('FIELD_ACCELERATION_FREQUENCY_DOMAIN'),
          suffix: 'm/s²',
          lang: language
        });
      case 'velocityTimeDomain':
        return getDisplayName({
          name: intl.get('FIELD_VELOCITY_TIME_DOMAIN'),
          suffix: 'mm/s',
          lang: language
        });
      case 'velocityFrequencyDomain':
        return getDisplayName({
          name: intl.get('FIELD_VELOCITY_FREQUENCY_DOMAIN'),
          suffix: 'mm/s',
          lang: language
        });
      case 'displacementTimeDomain':
        return getDisplayName({
          name: intl.get('FIELD_DISPLACEMENT_TIME_DOMAIN'),
          suffix: 'μm',
          lang: language
        });
      case 'displacementFrequencyDomain':
        return getDisplayName({
          name: intl.get('FIELD_DISPLACEMENT_FREQUENCY_DOMAIN'),
          suffix: 'μm',
          lang: language
        });
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
    const legends = [intl.get('AXIS_X'), intl.get('AXIS_Y'), intl.get('AXIS_Z')];
    if (deviceData === undefined && !isLoading) {
      return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    } else {
      let series: any = [];
      if (deviceData && deviceData.values) {
        series.push({
          data: { [legends[dimension]]: deviceData?.values.values },
          xAxisValues: deviceData.values.xAxis.map((n) => `${n}`),
          raw: {
            smooth: true
          }
        });
        if (isShowEnvelope) {
          series.push({
            data: { [legends[dimension]]: deviceData?.values.highEnvelopes },
            xAxisValues: deviceData.values.xAxis.map((n) => `${n}`),
            raw: {
              lineStyle: {
                opacity: 0
              },
              areaStyle: {
                color: '#ccc'
              },
              stack: 'confidence-band',
              smooth: true
            }
          });
          series.push({
            data: { [legends[dimension]]: deviceData?.values.lowEnvelopes },
            xAxisValues: deviceData.values.xAxis.map((n) => `${n}`),
            raw: {
              lineStyle: {
                opacity: 0
              },
              areaStyle: {
                color: '#ccc'
              },
              stack: 'confidence-band',
              smooth: true
            }
          });
        }
      }

      return (
        <PropertyChart
          dataZoom={true}
          loading={isLoading}
          rawOptions={{ title: { text: `${(deviceData?.values.frequency ?? 0) / 1000}KHz` } }}
          series={series}
          style={{ height: 500 }}
          xAxisUnit={deviceData?.values.xAxisUnit}
          yAxisMinInterval={0}
          yAxisValueMeta={{ precision: 3 }}
        />
      );
    }
  };

  const select_fields = (
    <Select
      defaultValue={calculate}
      style={{ width: !isMobile ? '120px' : '100%' }}
      onChange={setCalculate}
    >
      <Option key={'accelerationFrequencyDomain'} value={'accelerationFrequencyDomain'}>
        {intl.get('FIELD_ACCELERATION_FREQUENCY_DOMAIN')}
      </Option>
      <Option key={'accelerationTimeDomain'} value={'accelerationTimeDomain'}>
        {intl.get('FIELD_ACCELERATION_TIME_DOMAIN')}
      </Option>
      <Option key={'velocityFrequencyDomain'} value={'velocityFrequencyDomain'}>
        {intl.get('FIELD_VELOCITY_FREQUENCY_DOMAIN')}
      </Option>
      <Option key={'velocityTimeDomain'} value={'velocityTimeDomain'}>
        {intl.get('FIELD_VELOCITY_TIME_DOMAIN')}
      </Option>
      <Option key={'displacementFrequencyDomain'} value={'displacementFrequencyDomain'}>
        {intl.get('FIELD_DISPLACEMENT_FREQUENCY_DOMAIN')}
      </Option>
      <Option key={'displacementTimeDomain'} value={'displacementTimeDomain'}>
        {intl.get('FIELD_DISPLACEMENT_TIME_DOMAIN')}
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
            <RangeDatePicker onChange={setRange} />
          </Col>
        </Row>
        <Row style={{ marginBottom: 8 }} align='middle'>
          <Col span={14}>
            <Select
              style={{ width: '100%' }}
              defaultValue={deviceData?.timestamp}
              onChange={(value) => {
                if (value !== deviceData?.timestamp) {
                  setSelectedTimestamp(value);
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
              <RangeDatePicker onChange={setRange} />
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
                      setSelectedTimestamp(record.timestamp);
                    }
                  },
                  onMouseLeave: () => (window.document.body.style.cursor = 'default'),
                  onMouseEnter: () => (window.document.body.style.cursor = 'pointer')
                })}
                rowKey='timestamp'
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
