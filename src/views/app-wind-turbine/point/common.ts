import React from 'react';
import { FormInstance } from 'antd';
import { DeviceType } from '../../../types/device_type';
import { MonitoringPointTypeText, MonitoringPointTypeValue } from '../../../config';
import {
  AssetRow,
  bindDevice,
  MonitoringPoint,
  MonitoringPointBatch,
  MonitoringPointInfo,
  MonitoringPointRow,
  Point,
  unbindDevice,
  updateMeasurement,
  useContext
} from '../../asset-common';
import { flange, tower } from '../constants';
import { isFlangePreloadCalculation } from '../flange';

export function getMonitoringPointTypes(asset: AssetRow) {
  const { type } = asset;
  if (type === flange.type) {
    if (isFlangePreloadCalculation(asset)) {
      return [
        { id: MonitoringPointTypeValue.PRELOAD, label: MonitoringPointTypeText.PRELOAD },
        {
          id: MonitoringPointTypeValue.PRELOAD_ATTITUDE,
          label: MonitoringPointTypeText.PRELOAD_ATTITUDE
        }
      ];
    } else {
      return [
        {
          id: MonitoringPointTypeValue.LOOSENING_ANGLE,
          label: MonitoringPointTypeText.LOOSENING_ANGLE
        },
        { id: MonitoringPointTypeValue.PRELOAD, label: MonitoringPointTypeText.PRELOAD },
        {
          id: MonitoringPointTypeValue.PRELOAD_ATTITUDE,
          label: MonitoringPointTypeText.PRELOAD_ATTITUDE
        }
      ];
    }
  } else if (type === tower.type) {
    return [
      {
        id: MonitoringPointTypeValue.TOWER_INCLINATION,
        label: MonitoringPointTypeText.TOWER_INCLINATION
      },
      {
        id: MonitoringPointTypeValue.TOWER_BASE_SETTLEMENT,
        label: MonitoringPointTypeText.TOWER_BASE_SETTLEMENT
      }
    ];
  } else {
    return [];
  }
}

export function isParentValid(asset?: AssetRow) {
  const type = asset?.type;
  return type && (type === flange.type || type === tower.type);
}

export function useParents(asset?: AssetRow) {
  const { assets } = useContext();
  if (isParentValid(asset)) {
    return [];
  } else {
    const parents: AssetRow[] = [];
    assets.forEach(({ children }) => {
      if (children && children.length > 0) {
        parents.push(...children);
      }
    });
    return parents;
  }
}

export const getRelatedDeviceTypes = (type: number) => {
  const relatedDeviceTypes = new Map([
    [
      MonitoringPointTypeValue.LOOSENING_ANGLE,
      [DeviceType.BoltLoosening, DeviceType.BoltLooseningWIRED]
    ],
    [
      MonitoringPointTypeValue.PRELOAD,
      [
        DeviceType.BoltElongation,
        DeviceType.BoltElongation4Channels,
        DeviceType.BoltElongation8Channels
      ]
    ],
    [MonitoringPointTypeValue.PRELOAD_ATTITUDE, [DeviceType.BoltElongation]],
    [MonitoringPointTypeValue.TOWER_INCLINATION, [DeviceType.AngleDip]],
    [MonitoringPointTypeValue.TOWER_BASE_SETTLEMENT, [DeviceType.AngleDip]],
    [
      MonitoringPointTypeValue.FLANGE_PRELOAD,
      [
        DeviceType.BoltElongation,
        DeviceType.BoltElongation4Channels,
        DeviceType.BoltElongation8Channels
      ]
    ]
  ]);
  return relatedDeviceTypes.get(type);
};

export function useSelectPoints(form: FormInstance<MonitoringPointBatch>, channelName?: string) {
  const [selectedPoints, setSelectPoints] = React.useState<MonitoringPointInfo[]>([]);
  React.useEffect(() => {
    const mergeInputs = () => {
      const inputs = form.getFieldsValue();
      const points: MonitoringPointInfo[] = inputs.monitoring_points;
      let values: MonitoringPointInfo[] = selectedPoints.map((point) => ({
        ...point,
        name: getPointName(point.dev_name, point.channel)
      }));
      if (points && points.length > 0) {
        values = selectedPoints.map(({ dev_id, dev_name, channel }, index) => {
          const point = points.find(
            (item) => dev_id === item.dev_id && (item.channel ?? 0) === channel
          );
          if (point) {
            return point;
          } else {
            return { ...selectedPoints[index], name: getPointName(dev_name, channel, channelName) };
          }
        });
      }
      form.setFieldsValue({
        monitoring_points: values
      });
    };
    mergeInputs();
  }, [form, selectedPoints, channelName]);
  return { selectedPoints, setSelectPoints };
}

function getPointName(name: string, channel?: number, channelName?: string) {
  return `${name}${channel ? `-${channelName}${channel}` : ''}`;
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
    const processId = getProcessId(values.type, !!values.channel);
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
    updateMeasurement(id, values).then(() => {
      onSuccess();
    });
  } catch (error) {
    console.log(error);
  }
}

export function getProcessId(type?: number, isChannel?: boolean) {
  if (isChannel) {
    return 2;
  }
  if (type && Point.Assert.isTowerRelated(type)) {
    return 21;
  }
  return 1;
}
