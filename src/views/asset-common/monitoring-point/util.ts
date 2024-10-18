import { MonitoringPointTypeText, MonitoringPointTypeValue } from '../../../config';
import { DisplayProperty } from '../../../constants/properties';
import { MONITORING_POINT_DISPLAY_PROPERTIES } from './constants';
import { MonitoringPoint, MonitoringPointRow, Property } from './types';

export const Point = {
  Assert: {
    isThicknessRelated: (type: MonitoringPointTypeValue) => {
      return (
        type === MonitoringPointTypeValue.THICKNESS ||
        type === MonitoringPointTypeValue.THICKNESS_HIGH
      );
    },
    isTowerRelated: (type: MonitoringPointTypeValue) => {
      return (
        type === MonitoringPointTypeValue.TOWER_BASE_SETTLEMENT ||
        type === MonitoringPointTypeValue.TOWER_INCLINATION
      );
    },
    isPreload: (type: number) => {
      return (
        type === MonitoringPointTypeValue.PRELOAD ||
        type === MonitoringPointTypeValue.PRELOAD_ATTITUDE
      );
    },
    isWindRelated: (type: MonitoringPointTypeValue) => {
      return (
        Point.Assert.isPreload(type) ||
        Point.Assert.isTowerRelated(type) ||
        type === MonitoringPointTypeValue.LOOSENING_ANGLE
      );
    },
    isVibrationRelated: (type: MonitoringPointTypeValue) => {
      return (
        type === MonitoringPointTypeValue.VIBRATION ||
        type === MonitoringPointTypeValue.VIBRATION_RPM ||
        type === MonitoringPointTypeValue.VIBRATION_THREE_AXIS_RPM
      );
    },
    isCorrosionRelated: (type: MonitoringPointTypeValue) => {
      return (
        type === MonitoringPointTypeValue.THICKNESS ||
        type === MonitoringPointTypeValue.THICKNESS_HIGH
      );
    }
  },
  convert: (
    values?: MonitoringPointRow,
    resolveFn?: (attr: MonitoringPointRow['attributes']) => any
  ): MonitoringPoint | null => {
    if (!values) return null;
    const firstDevice =
      values.bindingDevices && values.bindingDevices.length > 0
        ? values.bindingDevices[0]
        : undefined;
    return {
      id: values.id,
      name: values.name,
      type: values.type,
      asset_id: values.assetId,
      device_id: firstDevice?.id,
      attributes: !!resolveFn ? resolveFn(values.attributes) : values.attributes,
      channel: firstDevice?.channel === 0 ? 1 : firstDevice?.channel
    };
  },
  getPropertiesByType: (properties: Property[], monitoringPointType: MonitoringPointTypeValue) => {
    const dispalyPropertiesSettings =
      MONITORING_POINT_DISPLAY_PROPERTIES[
        monitoringPointType as keyof typeof MONITORING_POINT_DISPLAY_PROPERTIES
      ];
    if (!dispalyPropertiesSettings || dispalyPropertiesSettings.length === 0) {
      return properties
        .filter((p) => !!p.isShow)
        .sort((prev, crt) => prev.sort - crt.sort) as DisplayProperty[];
    } else {
      return dispalyPropertiesSettings
        .filter((p) => !p.losingOnMonitoringPoint)
        .map((p) => {
          const remote = properties.find((r) =>
            p.parentKey ? r.key === p.parentKey : r.key === p.key
          );
          return {
            ...p,
            fields:
              p.fields ??
              remote?.fields
                ?.filter((f) => (p.parentKey ? f.key === p.key : true))
                .map((f, i) => ({
                  ...f,
                  first: p.defaultFirstFieldKey
                    ? f.key === p.defaultFirstFieldKey
                    : i === remote?.fields.length - 1
                }))
          };
        })
        .filter((p) => !!p.fields) as DisplayProperty[];
    }
  },
  getTypeLabel: (type: MonitoringPointTypeValue) => {
    for (const key in MonitoringPointTypeValue) {
      if (!Number.isNaN(Number(key)) && type === Number(key)) {
        const _key: keyof typeof MonitoringPointTypeValue = MonitoringPointTypeValue[
          key
        ] as keyof typeof MonitoringPointTypeValue;
        return MonitoringPointTypeText[_key];
      }
    }
  }
};

export const Points = {
  filter: (measurements?: MonitoringPointRow[]) => {
    if (!measurements) return [];
    return measurements.filter((point) => point.type !== MonitoringPointTypeValue.FLANGE_PRELOAD);
  },
  sort: (measurements: MonitoringPointRow[]) => {
    return measurements.sort((prev, next) => {
      const { index: prevIndex } = prev.attributes || { index: 88 };
      const { index: nextIndex } = next.attributes || { index: 88 };
      return prevIndex - nextIndex;
    });
  }
};

export function isMonitoringPoint(type: number) {
  return type > 10000;
}
