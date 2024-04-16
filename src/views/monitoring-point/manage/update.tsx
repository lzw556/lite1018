import { Form, ModalProps } from 'antd';
import * as React from 'react';
import { bindDevice, unbindDevice, updateMeasurement } from '../services';
import { MonitoringPoint, MonitoringPointRow, MONITORING_POINT } from '../types';
import { UpdateForm } from './updateForm';
import intl from 'react-intl-universal';
import { buildRequestAttrs, getProcessId } from '../utils';
import { ModalWrapper } from '../../../components/modalWrapper';

export const MonitoringPointUpdate: React.FC<
  ModalProps & { monitoringPoint: MonitoringPointRow; onSuccess: () => void }
> = (props) => {
  const { monitoringPoint, onSuccess } = props;
  const [form] = Form.useForm<MonitoringPoint & { device_id: number }>();

  return (
    <ModalWrapper
      {...{
        title: intl.get('EDIT_SOMETHING', { something: intl.get(MONITORING_POINT) }),
        okText: intl.get('SAVE'),
        ...props,
        onOk: () => {
          form.validateFields().then((values) => {
            try {
              const { id, bindingDevices } = monitoringPoint;
              const processId = getProcessId({
                monitoringPointType: values.type,
                isChannel: !!values.channel
              });
              if (bindingDevices && bindingDevices.length > 0) {
                if (
                  bindingDevices[0].id !== values.device_id ||
                  (values.channel && values.channel !== bindingDevices[0].channel)
                ) {
                  //replace
                  unbindDevice(id, bindingDevices[0].id).then((res) => {
                    if (res.data && res.data.code === 200) {
                      bindDevice(id, values.device_id, values.channel, processId);
                    }
                  });
                }
              } else {
                bindDevice(id, values.device_id, values.channel, processId);
              }
              const valuesWithAttrs = values.attributes
                ? {
                    ...values,
                    attributes: buildRequestAttrs(values.attributes, monitoringPoint.attributes)
                  }
                : null;
              updateMeasurement(id, valuesWithAttrs ?? values).then(() => {
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
    </ModalWrapper>
  );
};
