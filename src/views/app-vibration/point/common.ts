import React from 'react';
import { FormInstance } from 'antd';
import { DeviceType } from '../../../types/device_type';
import { MonitoringPointTypeText, MonitoringPointTypeValue } from '../../../config';
import {
  bindDevice,
  MonitoringPoint,
  MonitoringPointBatch,
  MonitoringPointInfo,
  MonitoringPointRow,
  unbindDevice,
  updateMeasurement
} from '../../asset-common';

export const monitoringPointTypes = [
  { id: MonitoringPointTypeValue.VIBRATION, label: MonitoringPointTypeText.VIBRATION },
  { id: MonitoringPointTypeValue.VIBRATION_RPM, label: MonitoringPointTypeText.VIBRATION_RPM },
  {
    id: MonitoringPointTypeValue.VIBRATION_THREE_AXIS_RPM,
    label: MonitoringPointTypeText.VIBRATION_THREE_AXIS_RPM
  }
];

export const relatedDeviceTypes = new Map([
  [
    MonitoringPointTypeValue.VIBRATION,
    [
      DeviceType.SVT210R,
      DeviceType.SVT220520,
      DeviceType.VibrationTemperature3AxisNB,
      DeviceType.VibrationTemperature3AxisAdvancedNB,
      DeviceType.SVT210510,
      DeviceType.SVT110
    ]
  ],
  [MonitoringPointTypeValue.VIBRATION_RPM, [DeviceType.SVT220S1]],
  [
    MonitoringPointTypeValue.VIBRATION_THREE_AXIS_RPM,
    [
      DeviceType.SVT210RS,
      DeviceType.SVT210S,
      DeviceType.SVT220S3,
      DeviceType.SVT210KL,
      DeviceType.SVT510L
    ]
  ]
]);

export function useSelectPoints(form: FormInstance<MonitoringPointBatch>) {
  const [selectedPoints, setSelectPoints] = React.useState<MonitoringPointInfo[]>([]);
  React.useEffect(() => {
    const mergeInputs = () => {
      const inputs = form.getFieldsValue();
      const points: MonitoringPointInfo[] = inputs.monitoring_points;
      let values: MonitoringPointInfo[] = selectedPoints.map((point) => ({
        ...point,
        name: point.dev_name
      }));
      if (points && points.length > 0) {
        values = selectedPoints.map(({ dev_id, dev_name }, index) => {
          const point = points.find((item) => dev_id === item.dev_id);
          if (point) {
            return point;
          } else {
            return { ...selectedPoints[index], name: dev_name };
          }
        });
      }
      form.setFieldsValue({
        monitoring_points: values
      });
    };
    mergeInputs();
  }, [form, selectedPoints]);
  return { selectedPoints, setSelectPoints };
}

export function handleSubmit(
  monitoringPoint: MonitoringPointRow,
  values: MonitoringPoint & {
    device_id: number;
  },
  onSuccess: () => void
) {
  try {
    const { id, bindingDevices } = monitoringPoint;
    const processId = 1;
    if (bindingDevices && bindingDevices.length > 0) {
      if (bindingDevices[0].id !== values.device_id) {
        //replace
        unbindDevice(id, bindingDevices[0].id).then((res) => {
          if (res.data && res.data.code === 200) {
            bindDevice(id, values.device_id, undefined, processId);
          }
        });
      }
    } else {
      bindDevice(id, values.device_id, undefined, processId);
    }
    updateMeasurement(id, values).then(() => {
      onSuccess();
    });
  } catch (error) {
    console.log(error);
  }
}
