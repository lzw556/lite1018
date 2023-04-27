import { MinusCircleOutlined } from '@ant-design/icons';
import { Button, Form, Input, InputNumber, Popover } from 'antd';
import React from 'react';
import { Device } from '../../../types/device';
import { DeviceSelection, MonitoringPointInfo } from './DeviceSelection';
import intl from 'react-intl-universal';
import { FormInputItem } from '../../../components/formInputItem';
import { MonitoringPointTypeValue } from '../types';

export const MonitoringPointFormItem = ({
  devices,
  onSelect,
  onRemove,
  initialSelected,
  selectedPointType
}: {
  devices: Device[];
  onSelect: (points: MonitoringPointInfo[]) => void;
  onRemove: (index: number) => void;
  initialSelected: MonitoringPointInfo[];
  selectedPointType?: number;
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
            <div
              style={{
                position: 'relative',
                border: 'dashed 1px #d9d9d9',
                paddingTop: 16,
                marginBottom: 16
              }}
            >
              <MinusCircleOutlined
                style={{ position: 'absolute', top: 0, right: 0 }}
                onClick={() => {
                  remove(name);
                  onRemove(index);
                }}
              />
              <Form.Item label={intl.get('NAME')} style={{ marginBottom: 0 }}>
                <FormInputItem
                  {...restFields}
                  name={[name, 'name']}
                  requiredMessage={intl.get('PLEASE_ENTER_NAME')}
                  lengthLimit={{ min: 4, max: 50, label: intl.get('NAME').toLowerCase() }}
                  style={{ display: 'inline-block', width: 200, marginRight: 20 }}
                >
                  <Input placeholder={intl.get('PLEASE_ENTER_NAME')} />
                </FormInputItem>
                <Form.Item name={[name, 'channel']} hidden={true}>
                  <Input />
                </Form.Item>
                <FormInputItem
                  label={intl.get('POSITION')}
                  {...restFields}
                  name={[name, 'place']}
                  requiredMessage={intl.get('PLEASE_ENTER_SOMETHING', {
                    something: intl.get('POSITION')
                  })}
                  style={{ display: 'inline-block', width: 200 }}
                  numericRule={{
                    isInteger: true,
                    min: 1,
                    message: intl.get('UNSIGNED_INTEGER_ENTER_PROMPT')
                  }}
                  placeholder={intl.get('PLEASE_ENTER_SOMETHING', {
                    something: intl.get('POSITION')
                  })}
                />
              </Form.Item>
              {selectedPointType === MonitoringPointTypeValue.THICKNESS && (
                <>
                  <Form.Item
                    label={`${intl.get('FIELD_THICKNESS')}(mm)`}
                    style={{ marginBottom: 0 }}
                  >
                    <FormInputItem
                      {...restFields}
                      name={[name, 'initial_thickness']}
                      requiredMessage={intl.get('PLEASE_ENTER_SOMETHING', {
                        something: intl.get('INITIAL_THICKNESS')
                      })}
                      numericRule={{
                        message: intl.get('PLEASE_ENTER_NUMERIC')
                      }}
                      style={{ display: 'inline-block', width: 200, marginRight: 20 }}
                      numericChildren={
                        <InputNumber
                          placeholder={intl.get('PLEASE_ENTER_SOMETHING', {
                            something: intl.get('INITIAL_THICKNESS')
                          })}
                          style={{ width: '100%' }}
                          controls={false}
                        />
                      }
                    />
                    <FormInputItem
                      {...restFields}
                      name={[name, 'critical_thickness']}
                      requiredMessage={intl.get('PLEASE_ENTER_SOMETHING', {
                        something: intl.get('CRITICAL_THICKNESS')
                      })}
                      numericRule={{
                        message: intl.get('PLEASE_ENTER_NUMERIC')
                      }}
                      style={{ display: 'inline-block', width: 200 }}
                      numericChildren={
                        <InputNumber
                          placeholder={intl.get('PLEASE_ENTER_SOMETHING', {
                            something: intl.get('CRITICAL_THICKNESS')
                          })}
                          style={{ width: '100%' }}
                          controls={false}
                        />
                      }
                    />
                  </Form.Item>
                  <Form.Item
                    label={`${intl.get('FIELD_CORROSION_RATE')}(${intl.get('UNIT_DAY')})`}
                    style={{ marginBottom: 0 }}
                  >
                    <FormInputItem
                      {...restFields}
                      name={[name, 'corrosion_rate_short_term']}
                      requiredMessage={intl.get('PLEASE_ENTER_SOMETHING', {
                        something: intl.get('CORROSION_RATE_SHORT_TERM')
                      })}
                      initialValue={30}
                      numericRule={{
                        isInteger: true,
                        min: 1,
                        message: intl.get('UNSIGNED_INTEGER_ENTER_PROMPT')
                      }}
                      style={{ display: 'inline-block', width: 200, marginRight: 20 }}
                      numericChildren={
                        <InputNumber
                          placeholder={intl.get('PLEASE_ENTER_SOMETHING', {
                            something: intl.get('CORROSION_RATE_SHORT_TERM')
                          })}
                          style={{ width: '100%' }}
                          controls={false}
                        />
                      }
                    />
                    <FormInputItem
                      {...restFields}
                      name={[name, 'corrosion_rate_long_term']}
                      requiredMessage={intl.get('PLEASE_ENTER_SOMETHING', {
                        something: intl.get('CORROSION_RATE_LONG_TERM')
                      })}
                      initialValue={365}
                      numericRule={{
                        isInteger: true,
                        min: 1,
                        message: intl.get('UNSIGNED_INTEGER_ENTER_PROMPT')
                      }}
                      style={{ display: 'inline-block', width: 200 }}
                      numericChildren={
                        <InputNumber
                          placeholder={intl.get('PLEASE_ENTER_SOMETHING', {
                            something: intl.get('CORROSION_RATE_LONG_TERM')
                          })}
                          style={{ width: '100%' }}
                          controls={false}
                        />
                      }
                    />
                  </Form.Item>
                </>
              )}
            </div>
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
