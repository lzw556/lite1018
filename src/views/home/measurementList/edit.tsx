import { Form, Modal, ModalProps } from 'antd';
import * as React from 'react';
import { defaultValidateMessages } from '../../../constants/validator';
import { EditFormPayload } from '../common/useActionBarStatus';
import { convertRow, Measurement } from '../summary/measurement/props';
import {
  addMeasurements,
  bindDevice,
  unbindDevice,
  updateMeasurement
} from '../summary/measurement/services';
import { EditContent } from './editContent';
import intl from 'react-intl-universal';

export const MeasurementEdit: React.FC<
  ModalProps & { payload?: EditFormPayload; onSuccess: () => void }
> = (props) => {
  const { payload, onSuccess } = props;
  const asset = payload?.asset;
  const measurement = payload?.measurement;
  const [form] = Form.useForm<Measurement & { device_id: number }>();
  const doUpdating = !!measurement;
  React.useEffect(() => {
    if (measurement && doUpdating) {
      form.resetFields();
      const values = convertRow(measurement);
      if (values) form.setFieldsValue(values);
    }
  }, [measurement, form, doUpdating]);

  return (
    <Modal
      {...{
        title: doUpdating
          ? intl.get('EDIT_SOMETHING', { something: intl.get('MONITORING_POINT') })
          : intl.get('CREATE_SOMETHING', { something: intl.get('MONITORING_POINT') }),
        cancelText: intl.get('CANCEL'),
        okText: doUpdating ? intl.get('UPDATE') : intl.get('CREATE'),
        ...props,
        onOk: () => {
          form.validateFields().then((values) => {
            try {
              if (!doUpdating) {
                addMeasurements({
                  monitoring_points: [
                    {
                      asset_id: values.asset_id,
                      name: values.name,
                      type: values.type,
                      attributes: values.attributes,
                      device_binding: values.channel
                        ? {
                            device_id: values.device_id,
                            process_id: 2,
                            parameters: { channel: values.channel }
                          }
                        : { device_id: values.device_id }
                    }
                  ]
                }).then(() => {
                  onSuccess();
                });
              } else if (measurement) {
                const { id, bindingDevices } = measurement;
                if (bindingDevices && bindingDevices.length > 0) {
                  if (bindingDevices[0].id !== values.device_id) {
                    //replace
                    unbindDevice(id, bindingDevices[0].id);
                    bindDevice(id, values.device_id, values.channel);
                  } else {
                    bindDevice(id, values.device_id, values.channel);
                  }
                } else {
                  bindDevice(id, values.device_id, values.channel);
                }
                updateMeasurement(id, values).then(() => {
                  onSuccess();
                });
              }
            } catch (error) {
              console.log(error);
            }
          });
        }
      }}
    >
      <Form form={form} labelCol={{ span: 4 }} validateMessages={defaultValidateMessages}>
        <EditContent
          asset={asset}
          form={form}
          doUpdating={doUpdating}
          initialDeviceType={
            measurement?.bindingDevices && measurement?.bindingDevices.length > 0
              ? measurement?.bindingDevices[0].typeId
              : undefined
          }
        />
      </Form>
    </Modal>
  );
};
