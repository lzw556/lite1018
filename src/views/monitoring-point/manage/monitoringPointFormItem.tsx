import { MinusCircleOutlined } from '@ant-design/icons';
import { Button, Form, Input, Popover, Space } from 'antd';
import React from 'react';
import { Device } from '../../../types/device';
import { DeviceSelection, MonitoringPointInfo } from './DeviceSelection';
import intl from 'react-intl-universal';
import { FormInputItem } from '../../../components/formInputItem';

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
  const [open, setVisible] = React.useState(false);

  return (
    <Form.List
      name='monitoring_points'
      rules={[
        {
          validator: async (_, points) => {
            if (!points || points.length <= 0) {
              return Promise.reject(new Error(intl.get('PLEASE_CREATE_MONITORING_POINT')));
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
                <FormInputItem
                  label={intl.get('NAME')}
                  labelCol={{ span: 7 }}
                  {...restFields}
                  name={[name, 'name']}
                  requiredMessage={intl.get('PLEASE_ENTER_NAME')}
                  lengthLimit={{ min: 4, max: 50, label: intl.get('NAME').toLowerCase() }}
                >
                  <Input placeholder={intl.get('PLEASE_ENTER_NAME')} />
                </FormInputItem>
                <Form.Item name={[name, 'channel']} hidden={true}>
                  <Input />
                </Form.Item>
                <FormInputItem
                  label={intl.get('POSITION')}
                  labelCol={{ span: 10 }}
                  {...restFields}
                  name={[name, 'place']}
                  requiredMessage={intl.get('PLEASE_ENTER_SOMETHING', {
                    something: intl.get('POSITION')
                  })}
                  numericRule={{
                    isInteger: true,
                    min: 1,
                    message: intl.get('UNSIGNED_INTEGER_ENTER_PROMPT')
                  }}
                  placeholder={intl.get('PLEASE_ENTER_SOMETHING', {
                    something: intl.get('POSITION')
                  })}
                />
              </Space>
            </>
          ))}

          <Form.Item wrapperCol={{ offset: 4 }}>
            <Popover
              title={intl.get('SELECT_SENSOR')}
              content={
                open && (
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
              open={open}
              onOpenChange={(open) => setVisible(open)}
              overlayStyle={{ width: 400 }}
            >
              <Button disabled={devices.length === 0}>{intl.get('SELECT_SENSOR')}</Button>
              <Form.ErrorList errors={errors} />
            </Popover>
          </Form.Item>
        </div>
      )}
    </Form.List>
  );
};
