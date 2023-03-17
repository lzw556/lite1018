import { Form, Modal, ModalProps } from 'antd';
import * as React from 'react';
import { AssetRow } from '../../asset';
import { bindDevice, unbindDevice, updateMeasurement } from '../services';
import { MonitoringPoint, MonitoringPointRow, UPDATE_MONITORING_POINT } from '../types';
import { UpdateForm } from './updateForm';

export const MonitoringPointUpdate: React.FC<
  ModalProps & { monitoringPoint: MonitoringPointRow; flanges: AssetRow[]; onSuccess: () => void }
> = (props) => {
  const { monitoringPoint, flanges, onSuccess } = props;
  const [form] = Form.useForm<MonitoringPoint & { device_id: number }>();

  return (
    <Modal
      {...{
        title: UPDATE_MONITORING_POINT,
        cancelText: '取消',
        okText: '编辑',
        ...props,
        onOk: () => {
          form.validateFields().then((values) => {
            try {
              const { id, bindingDevices } = monitoringPoint;
              if (bindingDevices && bindingDevices.length > 0) {
                if (bindingDevices[0].id !== values.device_id) {
                  //replace
                  unbindDevice(id, bindingDevices[0].id);
                  bindDevice(id, values.device_id, values.channel);
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
      <UpdateForm form={form} monitoringPoint={monitoringPoint} flanges={flanges} />
    </Modal>
  );
};
