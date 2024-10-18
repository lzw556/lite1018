import React from 'react';
import { FormInstance } from 'antd';
import {
  bindDevice,
  MonitoringPoint,
  MonitoringPointBatch,
  MonitoringPointInfo,
  MonitoringPointRow,
  unbindDevice,
  updateMeasurement
} from '../../asset-common';
import { DeviceType } from '../../../types/device_type';
import { MonitoringPointTypeText, MonitoringPointTypeValue } from '../../../config';

export const monitoringPointTypes = [
  { id: MonitoringPointTypeValue.THICKNESS, label: MonitoringPointTypeText.THICKNESS },
  { id: MonitoringPointTypeValue.THICKNESS_HIGH, label: MonitoringPointTypeText.THICKNESS_HIGH }
];

export const relatedDeviceTypes = new Map([
  [
    MonitoringPointTypeValue.THICKNESS,
    [DeviceType.NormalTemperatureCorrosion, DeviceType.NormalTemperatureCorrosionLora]
  ],
  [
    MonitoringPointTypeValue.THICKNESS_HIGH,
    [DeviceType.DC110H, DeviceType.HighTemperatureCorrosion]
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
    const { id, bindingDevices, attributes } = monitoringPoint;
    const processId = 11;
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
    updateMeasurement(id, {
      ...values,
      attributes: resolveAttrs(values.attributes, attributes)
    }).then(() => {
      onSuccess();
    });
  } catch (error) {
    console.log(error);
  }
}

// convert 'initial_thickness: { enabled: true; value: 5 }' to 'initial_thickness_enabled: true' and 'initial_thickness: 5'
export const resolveAttrs = (attributes: any, oldAttrs?: any) => {
  if (attributes) {
    const { critical_thickness, initial_thickness, ...rest } = attributes;
    let attr = { ...rest };
    if (critical_thickness) {
      attr = {
        ...attr,
        critical_thickness_enabled: critical_thickness.enabled
      };
      if (critical_thickness.value) {
        attr = { ...attr, critical_thickness: critical_thickness.value };
      } else if (oldAttrs && oldAttrs.critical_thickness) {
        attr = { ...attr, critical_thickness: oldAttrs.critical_thickness };
      }
    }
    if (initial_thickness) {
      attr = {
        ...attr,
        initial_thickness_enabled: initial_thickness.enabled
      };
      if (initial_thickness.value) {
        attr = { ...attr, initial_thickness: initial_thickness.value };
      } else if (oldAttrs && oldAttrs.initial_thickness) {
        attr = { ...attr, initial_thickness: oldAttrs.initial_thickness };
      }
    }
    return attr;
  }
  return attributes;
};

export const parseAttrs = (attributes: MonitoringPointRow['attributes']) => {
  let attr = null;
  if (attributes) {
    const {
      critical_thickness,
      critical_thickness_enabled,
      initial_thickness,
      initial_thickness_enabled,
      ...rest
    } = attributes;
    attr = { ...rest };
    if (critical_thickness) {
      attr = {
        ...attr,
        critical_thickness: {
          enabled: critical_thickness_enabled,
          value: critical_thickness
        }
      };
    }
    if (initial_thickness) {
      attr = {
        ...attr,
        initial_thickness: {
          enabled: initial_thickness_enabled,
          value: initial_thickness
        }
      };
    }
  }

  return attr ?? attributes;
};
