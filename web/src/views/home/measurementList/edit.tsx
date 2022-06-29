import { Form, Modal, ModalProps } from 'antd';
import * as React from 'react';
import { defaultValidateMessages } from '../../../constants/validator';
import { Measurement, MeasurementRow } from '../summary/measurement/props';
import {
  addMeasurement,
  bindDevice,
  getMeasurement,
  unbindDevice,
  updateMeasurement
} from '../summary/measurement/services';
import { EditContent } from './editContent';

export const MeasurementEdit: React.FC<
  ModalProps & { id?: number } & { onSuccess: () => void } & {
    assetId?: number;
  } & { flangeId?: number }
> = (props) => {
  const { id, onSuccess } = props;
  const [form] = Form.useForm<Measurement & { device_id: number }>();
  const [selectedRow, setSelectedRow] = React.useState<MeasurementRow>();

  React.useEffect(() => {
    if (id) {
      getMeasurement(id).then(setSelectedRow);
    }
  }, [id]);

  return (
    <Modal
      {...{
        title: id ? `监测点编辑` : `监测点添加`,
        cancelText: '取消',
        okText: id ? '更新' : '添加',
        ...props,
        onOk: () => {
          form.validateFields().then((values) => {
            const { id } = values;
            const { bindingDevices } = selectedRow || {};
            try {
              if (!id) {
                addMeasurement(values).then((measurement) => {
                  bindDevice(measurement.id, values.device_id);
                  onSuccess();
                });
              } else {
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
        <EditContent {...{ ...props, selectedRow }} form={form} />
      </Form>
    </Modal>
  );
};
