import { Button, Form } from 'antd';
import React from 'react';
import { isMobile } from '../../../../utils/deviceDetection';
import { AssetRow } from '../../../asset';
import { bindDevice, unbindDevice, updateMeasurement } from '../../services';
import { MonitoringPoint, MonitoringPointRow } from '../../types';
import intl from 'react-intl-universal';
import { UpdateForm } from '../../manage/updateForm';
import { buildRequestAttrs, getProcessId } from '../../utils';
import { useLocaleContext } from '../../../../localeProvider';

export const BasicSetting = ({
  monitoringPoint,
  onUpdateSuccess
}: {
  monitoringPoint: MonitoringPointRow;
  flanges: AssetRow[];
  onUpdateSuccess: () => void;
}) => {
  const [form] = Form.useForm<MonitoringPoint & { device_id: number }>();
  const { language } = useLocaleContext();

  return (
    <UpdateForm
      form={form}
      monitoringPoint={monitoringPoint}
      style={{ width: isMobile ? '100%' : '50%' }}
    >
      <Form.Item wrapperCol={{ offset: language === 'en-US' ? 0 : 6 }}>
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
                updateMeasurement(id, valuesWithAttrs ?? values).then(onUpdateSuccess);
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
