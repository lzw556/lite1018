import { FC, useCallback, useEffect, useState } from 'react';
import { Button, Col, Modal, Row, Select, Space } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { Content } from 'antd/lib/layout/layout';
import { Device } from '../../../../types/device';
import dayjs from '../../../../utils/dayjsUtils';
import { EmptyLayout } from '../../../layout';
import {
  FindDeviceDataRequest,
  GetDeviceRuntimeRequest,
  RemoveDeviceDataRequest
} from '../../../../apis/device';
import HasPermission from '../../../../permission';
import { Permission } from '../../../../permission/permission';
import Label from '../../../../components/label';
import { RangeDatePicker, oneWeekNumberRange } from '../../../../components/rangeDatePicker';
import { getDisplayProperties } from '../../util';
import { DeviceType } from '../../../../types/device_type';
import intl from 'react-intl-universal';
import { PropertyChart, transformHistoryData } from '../../../../components/charts/propertyChart';
import { DisplayProperty } from '../../../../constants/properties';
import { HistoryData } from '../../../asset-common';
import { Card } from '../../../../components';

const { Option } = Select;

export interface DeviceDataProps {
  device: Device;
}

const batteryVoltage: DisplayProperty = {
  key: 'batteryVoltage',
  name: 'BATTERY_VOLTAGE',
  precision: 0,
  unit: 'mV'
};
const signalStrength: DisplayProperty = {
  key: 'signalStrength',
  name: 'SIGNAL_STRENGTH',
  precision: 0,
  unit: 'dBm'
};

const HistoryDataPage: FC<DeviceDataProps> = ({ device }) => {
  const properties = getDisplayProperties(device.properties, device.typeId);
  if (!DeviceType.isWiredDevice(device.typeId)) {
    properties.push(batteryVoltage);
  }
  properties.push(signalStrength);
  const [property, setProperty] = useState<DisplayProperty | undefined>(
    properties.length > 0 ? properties[0] : undefined
  );
  const [range, setRange] = useState<[number, number]>(oneWeekNumberRange);
  const [dataSource, setDataSource] = useState<HistoryData>();
  const channels = DeviceType.isMultiChannel(device.typeId, true);
  const [channel, setChannel] = useState('1');
  const [runtimes, setRuntimes] = useState<
    {
      batteryVoltage: number;
      signalStrength: number;
      timestamp: number;
    }[]
  >([]);

  const fetchDeviceData = useCallback(() => {
    if (range) {
      const [from, to] = range;
      FindDeviceDataRequest(device.id, from, to, channels.length > 0 ? { channel } : {}).then(
        setDataSource
      );
      GetDeviceRuntimeRequest(device.id, from, to).then(setRuntimes);
    }
  }, [device.id, range, channel, channels.length]);

  useEffect(() => {
    fetchDeviceData();
  }, [fetchDeviceData]);

  const renderHistoryDataChart = () => {
    if (dataSource && dataSource.length > 0 && property) {
      if ([batteryVoltage, signalStrength].map(({ key }) => key).includes(property.key)) {
        if (runtimes.length > 0) {
          const xAxisValues = runtimes.map((item) =>
            dayjs.unix(item.timestamp).local().format('YYYY-MM-DD HH:mm:ss')
          );
          const { key, name } = property;
          return (
            <PropertyChart
              dataZoom={true}
              series={[
                {
                  data: {
                    [intl.formatMessage({ id: name })]: runtimes.map(
                      (item) => item[key as 'batteryVoltage' | 'signalStrength']
                    )
                  },
                  xAxisValues
                }
              ]}
              style={{ height: 650 }}
              withArea={true}
              yAxis={{ ...property, showName: true }}
            />
          );
        }
      } else {
        const transform = transformHistoryData(dataSource, property);
        return (
          transform && (
            <PropertyChart
              dataZoom={true}
              series={transform.series}
              style={{ height: 650 }}
              withArea={true}
              yAxis={{ ...property, showName: true }}
            />
          )
        );
      }
    }
    return <EmptyLayout description={intl.get('NO_DATA')} style={{ height: 300 }} />;
  };

  const onRemoveDeviceData = () => {
    if (device) {
      if (range) {
        const [from, to] = range;
        Modal.confirm({
          title: intl.get('PROMPT'),
          content: intl.get('DELETE_DEVICE_DATA_PROMPT', {
            device: device.name,
            start: dayjs.unix(from).local().format('YYYY-MM-DD'),
            end: dayjs.unix(to).local().format('YYYY-MM-DD')
          }),
          okText: intl.get('OK'),
          cancelText: intl.get('CANCEL'),
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
                {channels.length > 0 && (
                  <Label name={intl.get('CURRENT_CHANNEL')}>
                    <Select
                      onChange={(val) => setChannel(val)}
                      defaultValue={channel}
                      bordered={false}
                    >
                      {channels.map(({ label, value }) => (
                        <Select.Option value={value} key={value}>
                          {label}
                        </Select.Option>
                      ))}
                    </Select>
                  </Label>
                )}
                {properties && property && (
                  <Label name={intl.get('PROPERTY')}>
                    <Select
                      bordered={false}
                      defaultValue={property.key}
                      placeholder={intl.get('PLEASE_SELECT_SOMETHING', {
                        something: intl.get('PROPERTY')
                      })}
                      style={{ width: '120px' }}
                      onChange={(value) => {
                        setProperty(properties.find((item: any) => item.key === value));
                      }}
                    >
                      {properties.map((item) => (
                        <Option key={item.key} value={item.key}>
                          {intl.get(item.name).d(item.name)}
                        </Option>
                      ))}
                    </Select>
                  </Label>
                )}
                <RangeDatePicker onChange={setRange} showFooter={true} />
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
              <Card
                bordered={false}
                title={device.name}
                styles={{
                  body: { minHeight: '3em', borderColor: 'transparent', textAlign: 'center' }
                }}
              >
                {renderHistoryDataChart()}
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Content>
  );
};

export default HistoryDataPage;
