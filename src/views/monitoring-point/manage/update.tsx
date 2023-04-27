import { Form, Modal, ModalProps } from 'antd';
import * as React from 'react';
import { bindDevice, unbindDevice, updateMeasurement } from '../services';
import {
  MonitoringPoint,
  MonitoringPointRow,
  MONITORING_POINT,
  MonitoringPointTypeValue
} from '../types';
import { UpdateForm } from './updateForm';
import intl from 'react-intl-universal';

export const MonitoringPointUpdate: React.FC<
  ModalProps & { monitoringPoint: MonitoringPointRow; onSuccess: () => void }
> = (props) => {
  const { monitoringPoint, onSuccess } = props;
  const [form] = Form.useForm<MonitoringPoint & { device_id: number }>();

  return (
    <Modal
      {...{
        title: intl.get('EDIT_SOMETHING', { something: intl.get(MONITORING_POINT) }),
        cancelText: intl.get('CANCEL'),
        okText: intl.get('SAVE'),
        ...props,
        onOk: () => {
          form.validateFields().then((values) => {
            try {
              const { id, bindingDevices } = monitoringPoint;
              if (bindingDevices && bindingDevices.length > 0) {
                if (bindingDevices[0].id !== values.device_id) {
                  //replace
                  unbindDevice(id, bindingDevices[0].id);
                  bindDevice(
                    id,
                    values.device_id,
                    values.channel,
                    values.type === MonitoringPointTypeValue.THICKNESS ? 11 : undefined
                  );
                }
              } else {
                bindDevice(id, values.device_id, values.channel);
              }
              updateMeasurement(id, values).then(() => {
                onSuccess();
              });
            } catch (error) {
              console.log(error);
            }
          });
        }
      }}
    >
      <UpdateForm form={form} monitoringPoint={monitoringPoint} />
    </Modal>
  );
};
