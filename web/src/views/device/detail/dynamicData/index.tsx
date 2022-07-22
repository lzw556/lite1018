import {DownloadOutlined, MenuOutlined} from '@ant-design/icons';
import {Button, Col, ConfigProvider, DatePicker, Dropdown, Menu, Row, Select, Space, Table} from 'antd';
import moment from 'moment';
import * as React from 'react';
import { Device } from '../../../../types/device';
import { isMobile } from '../../../../utils/deviceDetection';
import { EmptyLayout } from '../../../layout';
import { useFindingDeviceData } from '../../hooks/useFindingDeviceData';
import usePermission, { Permission } from '../../../../permission/permission';
import EChartsReact from 'echarts-for-react';
import { Fields_ad, Fields_be, Fields_be_axis, fields_be_hasAxis, useGetingDeviceData, Values_ad, Values_be } from '../../hooks/useGetingDeviceData';
import Label from '../../../../components/label';
import { LineChartStyles } from '../../../../constants/chart';
import {DownloadDeviceDataByTimestampRequest, RemoveLargeDataRequest} from '../../../../apis/device';
import { DeviceType } from '../../../../types/device_type';
import { AXIS_THREE, DYNAMIC_DATA_ANGLEDIP, DYNAMIC_DATA_BOLTELONGATION } from './constants';
import ShadowCard from '../../../../components/shadowCard';

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

  const [isLoading2, data, fetchData] = useGetingDeviceData<Values_be | Values_ad>();

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

  const onDelete = (timestamp: number) => {
    RemoveLargeDataRequest(id, data_type, timestamp).then(_ => {
      fetchTimestamps(id, beginDate.utc().unix(), endDate.utc().unix(), {
        data_type
      });
    })
  }

  const onMenuClick = (key:any, timestamp:number) => {
    if (key === "download") {
      onDownload(timestamp)
    }else if (key === "delete") {
      onDelete(timestamp)
    }
  }

  const renderMenus = (timestamp:number) => {
    return <Menu onClick={e => onMenuClick(e.key, timestamp)}>
      {
          hasPermission(Permission.DeviceRawDataDownload) &&
          <Menu.Item key={"download"}>下载</Menu.Item>
      }
      {
          hasPermission(Permission.DeviceRawDataDelete) &&
          <Menu.Item key={"delete"}>删除</Menu.Item>
      }
    </Menu>
  }

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
    if (timestamp === 0 || !data || !data.values) {
      return <EmptyLayout description='数据不足' />;
    } else {
      let series: any = [];
      const values = data?.values;
      let items: number[] | Fields_be_axis[] = [];
      if (fields_be_hasAxis in values) {
        items = (values as Values_be)[field.value as Fields_be];
      } else {
        items = (values as Values_ad)[field.value as Fields_ad];
      }
      if (!items || items.length === 0) return <EmptyLayout description='数据不足' />;
      const isAcceleration = Number.isNaN(Number(items[0]));
      if (!isAcceleration) {
        series = [
          {
            type: 'line',
            name: field.label,
            data: (items as number[]).map((item) => item.toFixed(3)),
            itemStyle: { color: LineChartStyles[0].itemStyle.normal.color }
          }
        ];
      } else {
        series = AXIS_THREE.map((axis, index) => ({
          type: 'line',
          name: axis.label,
          data: (items as Fields_be_axis[])
            .map((item) => item[axis.value])
            .map((item) => item.toFixed(3)),
          itemStyle: { color: LineChartStyles[index].itemStyle.normal.color }
        }));
      }
      return (
        <EChartsReact
          loadingOption={{ text: '正在加载数据, 请稍等...' }}
          showLoading={isLoading2}
          style={{ height: 500 }}
          option={{
            legend: {
              data: !isAcceleration ? [field.label] : AXIS_THREE.map((item) => item.label)
            },
            title: { text: field.label, top: 0 },
            tooltip: {
              trigger: 'axis',
              formatter: (paras: any) => {
                return `<p>
                ${paras[0].dataIndex}
                <br />
                ${paras
                  .map(
                    (para: any) =>
                      `${para.marker}${para.seriesName} <strong>${para.data}</strong>${field.unit}`
                  )
                  .join('&nbsp;&nbsp;')}
              </p>`;
              }
            },
            xAxis: {
              type: 'category',
              data: series[0].data.map((item: any, index: number) => index)
            },
            series,
            ...defaultChartOption
          }}
          notMerge={true}
        />
      );
    }
  };

  const renderMeta = () => {
    if (timestamp === 0 || !data || !data.values || !data.values.metadata) {
      return null;
    } else {
      const meta = data.values.metadata;
      if ('min_preload' in meta) {
        return (
          <Row>
            {DYNAMIC_DATA_BOLTELONGATION.metaData.map((item) => (
              <Col span={isMobile ? 12: 8}>
                <Row>
                  <Col span={isMobile ? 24 : 8} className='ts-detail-label'>
                    {item.label}
                  </Col>
                  <Col span={isMobile ? 24 : 16} className='ts-detail-content'>
                    {meta[item.value] !== null && meta[item.value] !== undefined
                      ? `${meta[item.value] !== 0 ? meta[item.value].toFixed(3) : 0}${item.unit}`
                      : '-'}
                  </Col>
                </Row>
              </Col>
            ))}
          </Row>
        );
      } else {
        return (
          <Row>
            {DYNAMIC_DATA_ANGLEDIP.metaData.map((item) => (
              <Col span={isMobile ? 12: 8}>
                <Row>
                  <Col span={isMobile ? 24 : 8} className='ts-detail-label'>
                    {item.label}
                  </Col>
                  <Col span={isMobile ? 24 : 16} className='ts-detail-content'>
                    {meta[item.value] !== null && meta[item.value] !== undefined
                      ? `${meta[item.value] !== 0 ? meta[item.value].toFixed(3) : 0}${item.unit}`
                      : '-'}
                  </Col>
                </Row>
              </Col>
            ))}
          </Row>
        );
      }
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
        {timestamp !== 0 && <ShadowCard style={{marginBottom: 10}}>{renderMeta()}</ShadowCard>}
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
                    },
                    {
                      title: '操作',
                      dataIndex: 'timestamp',
                      key: 'action',
                      render: (timestamp: any, record: any) => {
                        return <Dropdown overlay={renderMenus(timestamp)}>
                          <Button type={"link"}><MenuOutlined/></Button>
                        </Dropdown>
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
        <Col xl={18} xxl={20} style={{backgroundColor:'#f0f2f5'}}>
          {timestamp !== 0 && <ShadowCard style={{marginBottom: 10}}>{renderMeta()}</ShadowCard>}
          <ShadowCard>
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
          </ShadowCard>
        </Col>
      </Row>
    );
  }
};
