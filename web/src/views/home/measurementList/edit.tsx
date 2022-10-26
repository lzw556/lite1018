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
        title: `监测点${doUpdating ? '编辑' : '添加'}`,
        cancelText: '取消',
        okText: doUpdating ? '更新' : '添加',
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
                      device_binding: { device_id: values.device_id }
                    }
                  ]
                }).then(() => {
                  onSuccess();
                });
              } else if (measurement) {
                const { id, bindingDevices } = measurement;
                if (
                  bindingDevices &&
                  bindingDevices.length > 0 &&
                  bindingDevices[0].id !== values.device_id
                ) {
                  unbindDevice(id, bindingDevices[0].id);
                  bindDevice(id, values.device_id);
                } else if (!bindingDevices || bindingDevices.length === 0) {
                  bindDevice(id, values.device_id);
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
        <EditContent asset={asset} form={form} />
      </Form>
    </Modal>
  );
};
