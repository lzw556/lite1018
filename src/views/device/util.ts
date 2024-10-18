import { Device } from '../../types/device';
import { Property } from '../../types/property';
import { DeviceType, SENSOR_DISPLAY_PROPERTIES } from '../../types/device_type';
import { DisplayProperty } from '../../constants/properties';
import { getValue, roundValue } from '../../utils/format';

export const getValueOfFirstClassProperty = (device: Device) => {
  const properties = getDisplayProperties(device.properties, device.typeId).filter((p) => p.first);
  const { data } = device;
  return pickDataOfFirstProperties(properties, data);
};

export function pickDataOfFirstProperties(
  properties: DisplayProperty[],
  data?: {
    timestamp: number;
    values: {
      [propName: string]: number | number[];
    };
  }
) {
  if (properties.length === 0) {
    return [];
  }
  return properties.map(({ name, key, unit, precision, fields }) => {
    let value = NaN;
    let fieldName = fields && fields.length > 1 ? fields[0].name : undefined;
    if (data && data.values) {
      const { values } = data;
      if (Object.hasOwn(values, key)) {
        value = roundValue(values[key] as number, precision);
      } else if (fields && fields.length > 0) {
        const values = fields
          .map((f) => ({ name: f.name, value: data.values[f.key], first: f.first }))
          .filter((f) => !!f.first);
        if (values.length > 0) {
          value = roundValue(values[0].value as number, precision);
          fieldName = values[0].name;
        }
      }
    }
    return { name, key, value: getValue(value, unit), fieldName };
  });
}

export const omitSpecificKeys = <T extends { [propName: string]: any }>(
  obj: T,
  keys: (keyof T)[],
  skipEmpty = true
) => {
  const newObj = Object.assign({}, obj);
  if (newObj) {
    Object.keys(newObj)
      .filter((key) => keys.find((_key) => _key === key))
      .forEach((key) => {
        delete newObj[key];
      });
    if (Object.keys(newObj).length > 0 && skipEmpty) {
      Object.keys(newObj).forEach((key) => {
        if (newObj[key] === undefined || newObj[key] === null || newObj[key] === '') {
          delete newObj[key];
        }
      });
    }
  }
  return newObj;
};

export type Filters = {
  name?: string;
  mac_address?: string;
  network_id?: number;
  type?: number;
  types?: string;
};

export function getDisplayProperties(properties: Property[], deviceType: DeviceType) {
  const remotes = properties.filter((pro) => pro.key !== 'channel');
  const dispalyPropertiesSettings =
    SENSOR_DISPLAY_PROPERTIES[deviceType as keyof typeof SENSOR_DISPLAY_PROPERTIES];
  if (!dispalyPropertiesSettings || dispalyPropertiesSettings.length === 0) {
    return remotes.sort((prev, crt) => prev.sort - crt.sort) as DisplayProperty[];
  } else {
    return dispalyPropertiesSettings
      .map((p) => {
        const remote = remotes.find((r) => (p.parentKey ? r.key === p.parentKey : r.key === p.key));
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
}

export const DeviceNS = {
  Children: {
    getOnlineStatusCount: (d: Device, devs: Device[]) => {
      const children = getChildren(d, devs);
      const online = children.filter((d) => !!d?.state?.isOnline).length;
      return { online, offline: children.length - online };
    }
  },
  Assert: {
    isRoot: (d: Device) => DeviceType.isRootDevice(d.typeId) && (!d.parent || d.parent.length === 0)
  }
};

function getChildren(dev: Device, devices: Device[]) {
  const all: Device[] = [];
  const children = devices.filter((d) => d.parent === dev.macAddress);
  all.push(...children);
  children.forEach((c) => {
    all.push(...getChildren(c, devices));
  });
  return all;
}
