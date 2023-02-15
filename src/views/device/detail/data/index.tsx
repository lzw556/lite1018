import { FC, useCallback, useEffect, useState } from 'react';
import { Button, Card, Col, Modal, Row, Select, Space } from 'antd';
import { DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import { Content } from 'antd/lib/layout/layout';
import { Device } from '../../../../types/device';
import moment from 'moment';
import { EmptyLayout } from '../../../layout';
import { FindDeviceDataRequest, RemoveDeviceDataRequest } from '../../../../apis/device';
import HasPermission from '../../../../permission';
import { Permission } from '../../../../permission/permission';
import Label from '../../../../components/label';
import { DefaultHistoryDataOption, LineChartStyles } from '../../../../constants/chart';
import ReactECharts from 'echarts-for-react';
import DownloadModal from './modal/downloadModal';
import { isMobile } from '../../../../utils/deviceDetection';
import { RangeDatePicker } from '../../../../components/rangeDatePicker';
import { getSpecificProperties } from '../../util';
import { DeviceType } from '../../../../types/device_type';

const { Option } = Select;

export interface DeviceDataProps {
  device: Device;
}

const HistoryDataPage: FC<DeviceDataProps> = ({ device }) => {
  const [property, setProperty] = useState<any>(
    device.properties.filter((pro) => pro.key !== 'channel')[0]
  );
  const [range, setRange] = useState<[number, number]>();
  const [dataSource, setDataSource] = useState<any>();
  const [downloadVisible, setDownloadVisible] = useState<boolean>(false);
  const isMultiChannels = device.typeId === DeviceType.BoltElongationMultiChannels;
  const [channel, setChannel] = useState('1');

  const fetchDeviceData = useCallback(() => {
    if (range) {
      const [from, to] = range;
      FindDeviceDataRequest(device.id, from, to, isMultiChannels ? { channel } : {}).then(
        setDataSource
      );
    }
  }, [device.id, range, channel, isMultiChannels]);

  useEffect(() => {
    fetchDeviceData();
  }, [fetchDeviceData]);

  const renderHistoryDataChart = () => {
    if (dataSource) {
      const data = dataSource.map((item: any) => {
        return {
          time: moment.unix(item.timestamp).local(),
          property: item.values.find((item: any) => item.key === property.key)
        };
      });
      const fields = new Map<string, number[]>();
      const times: any[] = [];
      data.forEach((item: any) => {
        times.push(item.time);
        Object.keys(item.property.data).forEach((key) => {
          if (!fields.has(key)) {
            fields.set(key, [item.property.data[key]]);
          } else {
            fields.get(key)?.push(item.property.data[key]);
          }
        });
      });
      const legends: string[] = [];
      const series: any[] = [];
      Array.from(fields.keys()).forEach((key, index) => {
        legends.push(key);
        series.push({
          ...LineChartStyles[index],
          name: key,
          type: 'line',
          data: fields.get(key)
        });
      });
      const option = {
        ...DefaultHistoryDataOption,
        tooltip: {
          trigger: 'axis',
          formatter: function (params: any) {
            let relVal = params[0].name;
            for (let i = 0; i < params.length; i++) {
              let value: any = Number(params[i].value);
              value = value ? value.toFixed(3) : value;
              relVal += `<br/> ${params[i].marker} ${params[i].seriesName}: ${value}${property.unit}`;
            }
            return relVal;
          }
        },
        title: { text: `${property.name}${property.unit ? `(${property.unit})` : ''}` },
        legend: { data: legends, left: isMobile ? 'right' : 'center' },
        series,
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: times.map((item: any) => item.format('YYYY-MM-DD HH:mm:ss'))
        }
      };
      return (
        <ReactECharts option={option} notMerge={true} style={{ height: `380px`, border: 'none' }} />
      );
    }
    return <EmptyLayout description={'暂无数据'} style={{ height: `400px` }} />;
  };

  const onRemoveDeviceData = () => {
    if (device) {
      if (range) {
        const [from, to] = range;
        Modal.confirm({
          title: '提示',
          content: `确定要删除设备${device.name}从${moment
            .unix(from)
            .local()
            .format('YYYY-MM-DD')}到${moment.unix(to).local().format('YYYY-MM-DD')}的数据吗？`,
          okText: '确定',
          cancelText: '取消',
          onOk: (close) => {
            RemoveDeviceDataRequest(device.id, from, to).then((_) => close());
          }
        });
      }
    }
  };

  return (
    <Content>
      <Row justify='center'>
        <Col span={24}>
          <Row justify='end'>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Space style={{ textAlign: 'center' }} wrap={true}>
                {isMultiChannels && (
                  <Label name='当前通道号'>
                    <Select
                      onChange={(val) => setChannel(val)}
                      defaultValue={channel}
                      bordered={false}
                    >
                      {[
                        { label: '1', key: 1 },
                        { label: '2', key: 2 },
                        { label: '3', key: 3 },
                        { label: '4', key: 4 }
                      ].map(({ label, key }) => (
                        <Select.Option value={key} key={key}>
                          {label}
                        </Select.Option>
                      ))}
                    </Select>
                  </Label>
                )}
                <Label name={'属性'}>
                  <Select
                    bordered={false}
                    defaultValue={property.key}
                    placeholder={'请选择属性'}
                    style={{ width: '120px' }}
                    onChange={(value) => {
                      setProperty(device.properties.find((item: any) => item.key === value));
                    }}
                  >
                    {device
                      ? getSpecificProperties(
                          device.properties.filter((pro) => pro.key !== 'channel'),
                          device.typeId
                        ).map((item) => (
                          <Option key={item.key} value={item.key}>
                            {item.name}
                          </Option>
                        ))
                      : null}
                  </Select>
                </Label>
                <RangeDatePicker
                  onChange={useCallback((range: [number, number]) => setRange(range), [])}
                  showFooter={true}
                />
                <HasPermission value={Permission.DeviceDataDownload}>
                  <Button
                    type='primary'
                    onClick={() => {
                      setDownloadVisible(true);
                    }}
                  >
                    <DownloadOutlined />
                  </Button>
                </HasPermission>
                <HasPermission value={Permission.DeviceDataDelete}>
                  <Button type='default' danger onClick={onRemoveDeviceData}>
                    <DeleteOutlined />
                  </Button>
                </HasPermission>
              </Space>
            </Col>
          </Row>
          <Row justify='center'>
            <Col span={24}>
              <Card bordered={false} style={{ height: `400px` }}>
                {renderHistoryDataChart()}
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
      {device && (
        <DownloadModal
          visible={downloadVisible}
          device={device}
          property={property}
          onCancel={() => {
            setDownloadVisible(false);
          }}
          onSuccess={() => {
            setDownloadVisible(false);
          }}
          channel={isMultiChannels ? channel : undefined}
        />
      )}
      {/*<RemoveModal visible={removeVisible} device={device} onCancel={() => setRemoveVisible(false)} onSuccess={() => {*/}
      {/*    setRemoveVisible(false)*/}
      {/*    setRefreshKey(refreshKey + 1)*/}
      {/*}}/>*/}
    </Content>
  );
};

export default HistoryDataPage;
