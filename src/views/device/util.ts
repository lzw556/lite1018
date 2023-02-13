import { round } from 'lodash';
import { FIRST_CLASS_PROPERTIES } from '../../constants/field';
import { Device } from '../../types/device';
import { Property } from '../../types/property';

export const getValueOfFirstClassProperty = (device: Device) => {
  const properties = getFirstClassFields(device);
  const { data } = device;
  if (data.timestamp < 0) return [];
  if (properties.length > 0) {
    return properties.map(({ name, key, unit, precision }) => {
      let value = NaN;
      if (data && data.values) {
        value = roundValue(data.values[key], precision);
      }
      return { name, value: getDisplayValue(value, unit) };
    });
  }
  return [];
};

function getDisplayValue(value: number | null | undefined, unit?: string) {
  if (Number.isNaN(value) || value === null || value === undefined) return '-';
  return `${value}${unit ?? ''}`;
}

function roundValue(value: number, precision?: number) {
  if (value === null || value === undefined) return Number.NaN;
  if (Number.isNaN(value) || value === 0) return value;
  return round(value, precision ?? 3);
}

function getFirstClassFields(device: Device) {
  if (!device.properties) return [];
  const fields: (Property['fields'][0] & Pick<Property, 'precision' | 'unit'>)[] = [];
  const propertiesOfType = FIRST_CLASS_PROPERTIES.find((pro) => pro.typeId === device.typeId);
  const fieldKeysOfType = propertiesOfType ? propertiesOfType.properties : [];
  fieldKeysOfType.forEach((fieldKey) => {
    for (const property of device.properties) {
      const field = property.fields.find((field) => field.key === fieldKey);
      if (field) {
        const name = field.name === property.name ? field.name : property.name;
        fields.push({ ...field, unit: property.unit, precision: property.precision, name });
        break;
      }
    }
  });
  return fields;
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

export function getSpecificProperties(
  properties: Property[],
  deviceType: number,
  includeRemainProperties: boolean = true
) {
  const propertiesOfType = FIRST_CLASS_PROPERTIES.find((pro) => pro.typeId === deviceType);
  const fieldKeysOfType = propertiesOfType ? propertiesOfType.properties : [];
  const sorted: Property[] = [];
  fieldKeysOfType.forEach((fieldKey) => {
    const property = properties.find(({ fields }) =>
      fields.map(({ key }) => key).includes(fieldKey)
    );
    if (property) sorted.push(property);
  });
  if (includeRemainProperties) {
    properties.forEach((property) => {
      if (!sorted.map(({ key }) => key).includes(property.key)) sorted.push(property);
    });
  }
  return sorted;
}
