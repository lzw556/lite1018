import { Col, Empty, Row, Select, Space, Spin, Table } from 'antd';
import EChartsReact from 'echarts-for-react';
import moment from 'moment';
import * as React from 'react';
import Label from '../../../../../components/label';
import { RangeDatePicker } from '../../../../../components/rangeDatePicker';
import ShadowCard from '../../../../../components/shadowCard';
import { LineChartStyles } from '../../../../../constants/chart';
import usePermission, { Permission } from '../../../../../permission/permission';
import { isMobile } from '../../../../../utils/deviceDetection';
import {
  AXIS_THREE,
  DYNAMIC_DATA_BOLTELONGATION
} from '../../../../device/detail/dynamicData/constants';
import { Fields_be, Fields_be_axis, Values_be } from '../../../../device/hooks/useGetingDeviceData';
import { EmptyLayout } from '../../../../layout';
import { getFilename } from '../../../common/utils';
import { MeasurementRow } from '../props';
import { downloadRawHistory, getData, getDynamicData } from '../services';

export const DynamicData: React.FC<MeasurementRow> = (props) => {
  const [range, setRange] = React.useState<[number, number]>();
  const [timestamps, setTimestamps] = React.useState<{ timestamp: number }[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [timestamp, setTimestamp] = React.useState<number>();
  const { hasPermission } = usePermission();
  const [dynamicData, setDynamicData] = React.useState<{ timestamp: number; values: Values_be }>();
  const [loading2, setLoading2] = React.useState(true);
  const { fields } = DYNAMIC_DATA_BOLTELONGATION;
  const [field, setField] = React.useState(fields[0]);

  React.useEffect(() => {
    if (range) {
      const [from, to] = range;
      getData(props.id, from, to, true).then((data) => {
        setTimestamps(data);
        setLoading(false);
      });
    }
  }, [range, props.id]);

  React.useEffect(() => {
    if (timestamps.length > 0) {
      setTimestamp(timestamps[0].timestamp);
    } else {
      setTimestamp(undefined);
    }
  }, [timestamps]);

  React.useEffect(() => {
    if (timestamp) {
      setLoading2(true);
      getDynamicData(props.id, timestamp).then((data) => {
        setDynamicData(data);
        setLoading2(false);
      });
    }
  }, [props.id, timestamp]);

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
          },
          {
            title: '操作',
            key: 'action',
            render: (text: any, record: any) => {
              if (hasPermission(Permission.DeviceRawDataDownload)) {
                return (
                  <Space
                    size='middle'
                    onClick={() => {
                      downloadRawHistory(props.id, text.timestamp).then((res) => {
                        const url = window.URL.createObjectURL(new Blob([res.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', getFilename(res));
                        document.body.appendChild(link);
                        link.click();
                      });
                    }}
                  >
                    <a>下载</a>
                  </Space>
                );
              }
            }
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

  const renderMeta = () => {
    if (!dynamicData || !dynamicData.values || !dynamicData.values.metadata) {
      return null;
    } else {
      const meta = dynamicData.values.metadata;
      return (
        <Row>
          {DYNAMIC_DATA_BOLTELONGATION.metaData.map((item) => (
            <Col span={isMobile ? 12 : 8}>
              <Row>
                <Col span={isMobile ? 24 : 8} className='ts-detail-label'>
                  {item.label}
                </Col>
                <Col span={isMobile ? 24 : 16} className='ts-detail-content'>
                  {getValueOfMetaItem(item.value, meta, item.unit)}
                </Col>
              </Row>
            </Col>
          ))}
        </Row>
      );
    }
  };

  const getValueOfMetaItem = (
    key: typeof DYNAMIC_DATA_BOLTELONGATION.metaData[number]['value'],
    meta?: Record<typeof DYNAMIC_DATA_BOLTELONGATION.metaData[number]['value'], number>,
    unit?: string
  ) => {
    if (!meta) return '-';
    if (!meta[key] && meta[key] !== 0) return '-';
    if (key === 'defect_location' && meta[key] <= 0) return '无缺陷';
    if (meta[key] !== 0) return `${meta[key].toFixed(3)}${unit}`;
    return `${meta[key]}${unit}`;
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

    if (loading2) return <Spin />;
    if (!dynamicData || !dynamicData.values) {
      return <EmptyLayout description='数据不足' />;
    } else {
      let series: any = [];
      const values = dynamicData?.values;
      let items: number[] | Fields_be_axis[] = (values as Values_be)[field.value as Fields_be];
      if (!items || items.length === 0) return <EmptyLayout description='数据不足' />;
      const isAcceleration = Number.isNaN(Number(items[0]));
      if (!isAcceleration) {
        series = [
          {
            type: 'line',
            name: field.label,
            data: (items as number[]).map((item) => (item ? item.toFixed(3) : item)),
            itemStyle: { color: LineChartStyles[0].itemStyle.normal.color }
          }
        ];
      } else {
        series = AXIS_THREE.map((axis, index) => ({
          type: 'line',
          name: axis.label,
          data: (items as Fields_be_axis[])
            .map((item) => item[axis.value])
            .map((item) => (item ? item.toFixed(3) : item)),
          itemStyle: { color: LineChartStyles[index].itemStyle.normal.color }
        }));
      }
      return (
        <EChartsReact
          loadingOption={{ text: '正在加载数据, 请稍等...' }}
          // showLoading={loading2}
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
                <Empty description='暂无数据' image={Empty.PRESENTED_IMAGE_SIMPLE}/>
              </Col>
            )}
            {timestamps.length > 0 && <Col span={6}>{renderTimestampsList()}</Col>}
            {timestamp && (
              <Col span={18} style={{ backgroundColor: '#f0f2f5' }}>
                <Row gutter={[0, 12]}>
                  <Col span={24}>
                    <ShadowCard>{renderMeta()}</ShadowCard>
                  </Col>
                  <Col span={24}>
                    <ShadowCard>
                      <Row gutter={[0, 8]}>
                        <Col span={24}>
                          <Row justify='end'>
                            <Col>
                              <Label name={'属性'}>
                                <Select
                                  bordered={false}
                                  defaultValue={fields[0].value}
                                  placeholder={'请选择属性'}
                                  style={{ width: '120px' }}
                                  onChange={(value, option: any) =>
                                    setField({
                                      label: option.children,
                                      value: option.key,
                                      unit: option.props['data-unit']
                                    } as any)
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
                        </Col>
                        <Col span={24}>{renderChart()}</Col>
                      </Row>
                    </ShadowCard>
                  </Col>
                </Row>
              </Col>
            )}
          </Row>
        )}
      </Col>
    </Row>
  );
};
