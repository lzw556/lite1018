import { Button, Form } from 'antd';
import React from 'react';
import { isMobile } from '../../../../../utils/deviceDetection';
import { AssetRow } from '../../../../asset';
import { UpdateForm } from '../../../manage/hydro-turbine/updateForm';
import { bindDevice, unbindDevice, updateMeasurement } from '../../../services';
import { MonitoringPoint, MonitoringPointRow } from '../../../types';
import intl from 'react-intl-universal';

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
      <Form.Item wrapperCol={{ offset: 10 }}>
        <Button
          type='primary'
          onClick={() => {
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
