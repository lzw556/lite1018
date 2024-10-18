import React from 'react';
import { Button, Col, Form, Input, Popover, Row } from 'antd';
import { MinusCircleOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import { Device } from '../../../types/device';
import { GetDevicesRequest } from '../../../apis/device';
import { FormInputItem } from '../../../components/formInputItem';
import { isMobile } from '../../../utils/deviceDetection';
import { DeviceSelection, MonitoringPointInfo } from '../../asset-common';
import * as Tower from './tower';
import { getRelatedDeviceTypes } from './common';

export const PointItemList = ({
  onSelect,
  onRemove,
  initialSelected,
  type
}: {
  onSelect: (points: MonitoringPointInfo[]) => void;
  onRemove: (index: number) => void;
  initialSelected: MonitoringPointInfo[];
  type: number;
}) => {
  const [devices, setDevices] = React.useState<Device[]>([]);
  const [open, setVisible] = React.useState(false);

  React.useEffect(() => {
    const deviceTypes = getRelatedDeviceTypes(type);
    if (deviceTypes) GetDevicesRequest({ types: deviceTypes.join(',') }).then(setDevices);
  }, [type]);

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
        <>
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
              <Row>
                <Col span={12}>
                  <FormInputItem
                    {...restFields}
                    label={intl.get('NAME')}
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
                </Col>
                <Col span={12}>
                  <FormInputItem
                    label={intl.get('POSITION')}
                    {...restFields}
                    name={[name, 'attributes', 'index']}
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
                </Col>
              </Row>
              <Tower.Index mode='create' name={name} restFields={restFields} type={type} />
            </div>
          ))}
          <Form.Item>
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
              placement={isMobile ? 'top' : 'rightTop'}
              open={open}
              onOpenChange={(open) => setVisible(open)}
              overlayStyle={{ width: 400 }}
            >
              <Button disabled={devices.length === 0}>{intl.get('SELECT_SENSOR')}</Button>
              <Form.ErrorList errors={errors} />
            </Popover>
          </Form.Item>
        </>
      )}
    </Form.List>
  );
};
