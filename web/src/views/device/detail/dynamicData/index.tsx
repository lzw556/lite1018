import { DownloadOutlined } from '@ant-design/icons';
import { Col, ConfigProvider, DatePicker, Row, Select, Space, Table } from 'antd';
import moment from 'moment';
import * as React from 'react';
import { Device } from '../../../../types/device';
import { isMobile } from '../../../../utils/deviceDetection';
import { EmptyLayout } from '../../../layout';
import { useFindingDeviceData } from '../../hooks/useFindingDeviceData';
import usePermission, { Permission } from '../../../../permission/permission';
import EChartsReact from 'echarts-for-react';
import { useGetingDeviceData, Values, Values_ad, Values_be } from '../../hooks/useGetingDeviceData';
import Label from '../../../../components/label';
import { LineChartStyles } from '../../../../constants/chart';
import { DownloadDeviceDataByTimestampRequest } from '../../../../apis/device';
import { DeviceType } from '../../../../types/device_type';
import { DYNAMIC_DATA_ANGLEDIP, DYNAMIC_DATA_BOLTELONGATION } from './constants';
import { values } from 'lodash';

export const DynamicData: React.FC<Device> = ({ id, typeId }) => {
  const { fields, data_type } =
    typeId === DeviceType.AngleDip ? DYNAMIC_DATA_ANGLEDIP : DYNAMIC_DATA_BOLTELONGATION;
  const [beginDate, setBeginDate] = React.useState(moment().subtract(3, 'days').startOf('day'));
  const [endDate, setEndDate] = React.useState(moment().endOf('day'));
  const [isLoading, timestamps, fetchTimestamps] = useFindingDeviceData();
  const [timestamp, setTimestamp] = React.useState(0);
  const [field, setField] = React.useState(fields[0]);
  const { hasPermission } = usePermission();
  React.useEffect(() => {
    fetchTimestamps(id, beginDate.utc().unix(), endDate.utc().unix(), {
      data_type
    });
  }, [id, beginDate, endDate, fetchTimestamps, data_type]);

  React.useEffect(() => {
    if (timestamps.length > 0) setTimestamp(timestamps[0].timestamp);
  }, [timestamps]);

  const [isLoading2, data, fetchData] = useGetingDeviceData();

  React.useEffect(() => {
    if (timestamp > 0) {
      fetchData(id, timestamp, { data_type });
    }
  }, [timestamp, id, fetchData, data_type]);

  const onDownload = (timestamp: number) => {
    DownloadDeviceDataByTimestampRequest(id, timestamp, {
      data_type
    }).then((res) => {
      if (res.status === 200) {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
          'download',
          `${moment.unix(timestamp).local().format('YYYY-MM-DD_hh-mm-ss')}${field.label}.csv`
        );
        document.body.appendChild(link);
        link.click();
      }
    });
  };

  const renderChart = () => {
    const defaultChartOption = {
      grid: {
        left: '2%',
        right: '8%',
        bottom: '12%',
        containLabel: true,
        borderWidth: '0'
      },
      yAxis: { type: 'value' },
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
    if (timestamp === 0 || !data) {
      return <EmptyLayout description='数据不足' />;
    } else {
      const series: number[] = data?.values[field.value as keyof Values].map((item: number) =>
        item.toFixed(3)
      );
      return (
        <EChartsReact
          loadingOption={{ text: '正在加载数据, 请稍等...' }}
          showLoading={isLoading2}
          style={{ height: 500 }}
          option={{
            legend: {
              data: [field.label],
              itemStyle: {
                color: LineChartStyles[0].itemStyle.normal.color
              }
            },
            title: { text: field.label, top: 0 },
            tooltip: {
              trigger: 'axis',
              formatter: (paras: any) => {
                return `<p>
                ${paras[0].dataIndex}
                <br />
                ${paras[0].marker} <strong>${paras[0].data}</strong> ${field.unit}
              </p>`;
              }
            },
            xAxis: {
              type: 'category',
              data: series.map((item, index) => index)
            },
            series: {
              data: series,
              type: 'line',
              name: field.label,
              itemStyle: {
                color: LineChartStyles[0].itemStyle.normal.color
              }
            },
            ...defaultChartOption
          }}
          notMerge={true}
        />
      );
    }
  };

  if (isLoading) return <p>loading...</p>;
  if (isMobile) {
    if (timestamps.length === 0) {
      return <EmptyLayout description={'动态数据列表为空'} />;
    }
    return (
      <>
        <Row style={{ marginBottom: 8 }}>
          <Col span={24}>
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
          </Col>
        </Row>
        <Row style={{ marginBottom: 8 }} align='middle'>
          <Col span={18}>
            <Select
              style={{ width: '100%' }}
              defaultValue={timestamps[0].timestamp}
              onChange={(value) => {
                if (value !== timestamp) {
                  setTimestamp(value);
                }
              }}
            >
              {timestamps.map((item: any) => (
                <Select.Option key={item.timestamp} value={item.timestamp}>
                  {moment.unix(item.timestamp).local().format('YYYY-MM-DD HH:mm:ss')}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col offset={2} span={2}>
            <DownloadOutlined onClick={() => onDownload(timestamp)} />
          </Col>
        </Row>
        <Row>
          <Col span={20}>
            <Label name={'属性'}>
              <Select
                bordered={false}
                defaultValue={fields[0].value}
                placeholder={'请选择属性'}
                onChange={(value, option: any) =>
                  setField({ label: option.children, value: option.key, unit: option.props['data-unit']} as any)
                }
              >
                {fields.map(({ label, value, unit }) => (
                  <Select.Option key={value} value={value} data-unit={unit}>
                    {label}
                  </Select.Option>
                ))}
              </Select>
            </Label>
          </Col>
        </Row>
        <Row style={{ marginTop: 8 }}>
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
            </Col>
          </Row>
          <Row justify={'space-between'} style={{ paddingTop: '0px' }}>
            <Col span={24}>
              <ConfigProvider renderEmpty={() => <EmptyLayout description={'动态数据列表为空'} />}>
                <Table
                  size={'middle'}
                  scroll={{ y: 500 }}
                  showHeader={false}
                  columns={[
                    {
                      title: '时间',
                      dataIndex: 'timestamp',
                      key: 'timestamp',
                      width: '80%',
                      render: (timestamp: number) =>
                        moment.unix(timestamp).local().format('YYYY-MM-DD HH:mm:ss')
                    },
                    {
                      title: '操作',
                      key: 'action',
                      render: (text: any, record: any) => {
                        if (hasPermission(Permission.DeviceRawDataDownload)) {
                          return (
                            <Space size='middle'>
                              <a onClick={() => onDownload(timestamp)}>下载</a>
                            </Space>
                          );
                        }
                      }
                    }
                  ]}
                  pagination={false}
                  dataSource={timestamps}
                  rowClassName={(record) =>
                    record.timestamp === timestamp ? 'ant-table-row-selected' : ''
                  }
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
              </ConfigProvider>
            </Col>
          </Row>
        </Col>
        <Col xl={18} xxl={20}>
          <Row justify='end'>
            <Col>
              <Label name={'属性'}>
                <Select
                  bordered={false}
                  defaultValue={fields[0].value}
                  placeholder={'请选择属性'}
                  style={{ width: '120px' }}
                  onChange={(value, option: any) =>
                    setField({ label: option.children, value: option.key, unit: option.props['data-unit']} as any)
                  }
                >
                  {fields.map(({ label, value, unit }) => (
                    <Select.Option key={value} value={value} data-unit={unit}>
                      {label}
                    </Select.Option>
                  ))}
                </Select>
              </Label>
            </Col>
          </Row>
          <Row justify={'start'}>
            <Col span={24}>{renderChart()}</Col>
          </Row>
        </Col>
      </Row>
    );
  }
};
