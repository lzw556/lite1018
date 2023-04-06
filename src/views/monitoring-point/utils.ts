import { cloneDeep } from 'lodash';
import dayjs from '../../utils/dayjsUtils';
import { getDisplayValue, roundValue } from '../../utils/format';
import {
  MonitoringPoint,
  MonitoringPointRow,
  MonitoringPointTypeValue,
  MONITORING_POINT_FIRST_CLASS_FIELDS_MAPPING,
  MONITORING_POINT_TYPE_VALUE_DYNAMIC_MAPPING,
  Property
} from './types';
import intl from 'react-intl-universal';

export function getKeysOfFirstClassFields(measurementType: number) {
  return MONITORING_POINT_FIRST_CLASS_FIELDS_MAPPING.get(measurementType) ?? [];
}

export function convertRow(values?: MonitoringPointRow): MonitoringPoint | null {
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
    attributes: values.attributes,
    channel: firstDevice?.channel === 0 ? 1 : firstDevice?.channel
  };
}

export function getFirstClassFields(measurement: MonitoringPointRow) {
  if (!measurement.properties) return [];
  const fields: (Property['fields'][0] & Pick<Property, 'precision' | 'unit'>)[] = [];
  getKeysOfFirstClassFields(measurement.type).forEach((fieldKey) => {
    for (const property of measurement.properties) {
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

export function getSpecificProperties(
  properties: Property[],
  measurementType: number,
  includeRemainProperties: boolean = true
) {
  const filterableProperties = properties.filter(({ isShow }) => isShow);
  const fieldKeysOfType = getKeysOfFirstClassFields(measurementType);
  const sorted: Property[] = [];
  fieldKeysOfType.forEach((fieldKey) => {
    const property = filterableProperties.find(({ fields }) =>
      fields.map(({ key }) => key).includes(fieldKey)
    );
    if (property) sorted.push(property);
  });
  if (includeRemainProperties) {
    filterableProperties.forEach((property) => {
      if (!sorted.map(({ key }) => key).includes(property.key)) sorted.push(property);
    });
  }
  return sorted;
}

export function removeDulpicateProperties(properties: Property[]) {
  const final = cloneDeep(properties);
  return final.map((property) => {
    const fields = property.fields;
    if (fields.every((field) => field.key === property.key)) {
      return { ...property, fields: [] };
    } else {
      return property;
    }
  });
}

export function generateDatasOfMeasurement(measurement: MonitoringPointRow) {
  const properties = getFirstClassFields(measurement);
  const { data } = measurement;
  if (properties.length > 0) {
    return properties.map(({ name, key, unit, precision }) => {
      let value = NaN;
      if (data && data.values) {
        value = roundValue(data.values[key] as number, precision);
      }
      return { name, value: getDisplayValue(value, unit) };
    });
  }
  return [];
}

export function generatePropertyColumns(measurement: MonitoringPointRow) {
  const properties = getFirstClassFields(measurement);
  if (properties.length > 0) {
    return properties
      .map(({ name, key, unit, precision }) => ({
        title: `${intl.get(name)}${unit ? `(${unit})` : ''}`,
        key,
        render: ({ data }: MonitoringPointRow) => {
          let value = NaN;
          if (data && data.values) {
            value = roundValue(data.values[key] as number, precision);
          }
          return getDisplayValue(value, unit);
        },
        width: 120
      }))
      .concat({
        title: intl.get('SAMPLE_TIME'),
        key: 'timestamp',
        render: (measurement: MonitoringPointRow) => {
          return measurement.data && measurement.data.timestamp
            ? dayjs(measurement.data.timestamp * 1000).format('YYYY-MM-DD HH:mm:ss')
            : '-';
        },
        width: 200
      });
  }
  return [];
}

export function sortMonitoringPointByAttributes(measurements: MonitoringPointRow[]) {
  return measurements.sort((prev, next) => {
    const { index: prevIndex } = prev.attributes || { index: 8 };
    const { index: nextIndex } = next.attributes || { index: 8 };
    return prevIndex - nextIndex;
  });
}

export function checkHasDynamicData(type: number) {
  return MONITORING_POINT_TYPE_VALUE_DYNAMIC_MAPPING.get(type)?.dynamicData !== undefined;
}

export function checkHasWaveData(type: number) {
  return MONITORING_POINT_TYPE_VALUE_DYNAMIC_MAPPING.get(type)?.waveData !== undefined;
}

export function getRealPoints(measurements?: MonitoringPointRow[]) {
  if (!measurements) return [];
  return measurements.filter((point) => point.type !== MonitoringPointTypeValue.FLANGE_PRELOAD);
}

export function pickId(id: string | number) {
  if (typeof id === 'number') {
    return id;
  } else if (id.indexOf('-') > -1) {
    return Number(id.substring(0, id.indexOf('-')));
  }
  return 0;
}
