import { Button, Form } from 'antd';
import React from 'react';
import { isMobile } from '../../../../utils/deviceDetection';
import { AssetRow } from '../../../asset';
import { bindDevice, unbindDevice, updateMeasurement } from '../../services';
import { MonitoringPoint, MonitoringPointRow } from '../../types';
import intl from 'react-intl-universal';
import { UpdateForm } from '../../manage/updateForm';
import { getProcessId } from '../../utils';

export const BasicSetting = ({
  monitoringPoint,
  onUpdateSuccess
}: {
  monitoringPoint: MonitoringPointRow;
  flanges: AssetRow[];
  onUpdateSuccess: () => void;
}) => {
  const [form] = Form.useForm<MonitoringPoint & { device_id: number }>();

  return (
    <UpdateForm
      form={form}
      monitoringPoint={monitoringPoint}
      style={{ width: isMobile ? '100%' : '50%' }}
    >
      <Form.Item wrapperCol={{ offset: 4 }}>
        <Button
          type='primary'
          onClick={() => {
            form.validateFields().then((values) => {
              try {
                const { id, bindingDevices } = monitoringPoint;
                const processId = getProcessId({
                  monitoringPointType: values.type,
                  isChannel: !!values.channel
                });
                if (bindingDevices && bindingDevices.length > 0) {
                  if (bindingDevices[0].id !== values.device_id) {
                    //replace
                    unbindDevice(id, bindingDevices[0].id);
                    bindDevice(id, values.device_id, values.channel, processId);
                  }
                } else {
                  bindDevice(id, values.device_id, values.channel, processId);
                }
                updateMeasurement(id, values).then(onUpdateSuccess);
              } catch (error) {
                console.log(error);
              }
            });
          }}
        >
          {intl.get('SAVE')}
        </Button>
      </Form.Item>
    </UpdateForm>
  );
};
