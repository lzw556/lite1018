import { MinusCircleOutlined } from '@ant-design/icons';
import { Button, Form, Input, Popover, Space } from 'antd';
import React from 'react';
import { Rules } from '../../../constants/validator';
import { Device } from '../../../types/device';
import {
  MONITORING_POINT_NAME,
  MONITORING_POINT_POSITION,
  PLEASE_CREATE_MONITORING_POINT,
  PLEASE_INPUT_MONITORING_POINT_NAME,
  PLEASE_INPUT_MONITORING_POINT_POSITION
} from '../types';
import { DeviceSelection, MonitoringPointInfo } from './DeviceSelection';

export const MonitoringPointFormItem = ({
  devices,
  onSelect,
  onRemove,
  initialSelected
}: {
  devices: Device[];
  onSelect: (points: MonitoringPointInfo[]) => void;
  onRemove: (index: number) => void;
  initialSelected: MonitoringPointInfo[];
}) => {
  const [visible, setVisible] = React.useState(false);

  return (
    <Form.List
      name='monitoring_points'
      rules={[
        {
          validator: async (_, points) => {
            if (!points || points.length <= 0) {
              return Promise.reject(new Error(PLEASE_CREATE_MONITORING_POINT));
            }
          }
        }
      ]}
    >
      {(fields, { add, remove }, { errors }) => (
        <div style={{ overflow: 'auto', maxHeight: 600 }}>
          {fields.map(({ key, name, ...restFields }, index) => (
            <>
              <Space>
                <MinusCircleOutlined
                  onClick={() => {
                    remove(name);
                    onRemove(index);
                  }}
                  style={{ position: 'relative', top: -12 }}
                />
                <Form.Item
                  label={MONITORING_POINT_NAME}
                  labelCol={{ span: 10 }}
                  {...restFields}
                  name={[name, 'name']}
                  rules={[Rules.range(4, 16)]}
                >
                  <Input placeholder={PLEASE_INPUT_MONITORING_POINT_NAME} />
                </Form.Item>
                <Form.Item name={[name, 'channel']} hidden={true}></Form.Item>
                <Form.Item
                  label={MONITORING_POINT_POSITION}
                  labelCol={{ span: 12 }}
                  {...restFields}
                  name={[name, 'place']}
                  rules={[Rules.number]}
                >
                  <Input
                    placeholder={PLEASE_INPUT_MONITORING_POINT_POSITION}
                    style={{ width: 100 }}
                  />
                </Form.Item>
              </Space>
            </>
          ))}
          <Form.ErrorList errors={errors} />
          <Form.Item wrapperCol={{ offset: 6 }}>
            <Popover
              title='选择设备'
              content={
                visible && (
                  <DeviceSelection
                    devices={devices}
                    onSelect={(selecteds) => {
                      setVisible(false);
                      onSelect(selecteds);
                    }}
                    initialSelected={initialSelected}
                  />
                )
              }
              trigger={['click']}
              placement='rightTop'
              open={visible}
              onOpenChange={(visible) => setVisible(visible)}
              overlayStyle={{ width: 400 }}
            >
              <Button disabled={devices.length === 0}>选择传感器</Button>
            </Popover>
          </Form.Item>
        </div>
      )}
    </Form.List>
  );
};
