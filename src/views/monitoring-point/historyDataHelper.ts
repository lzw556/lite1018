import { roundValue } from '../../utils/format';
import { HistoryData, Property } from './types';
import { getSpecificProperties } from './utils';

export function getHistoryDatas(data: HistoryData, measurementType: number, propertyKey?: string) {
  if (data.length === 0) return [];
  const firstValue = getSpecificProperties(data[0].values, measurementType);
  const times = data.map(({ timestamp }) => timestamp);
  return firstValue
    .filter((property) => (propertyKey ? property.key === propertyKey : true))
    .map((property) => {
      const seriesData = property.fields.map((field) => {
        const fieldValue = narrowSpecificProperty(data, property.key).map(({ value }) =>
          takeFieldValue(value, field.key)
        );
        return { name: field.name, data: fieldValue };
      });
      return { times, seriesData, property };
    });
}

function narrowSpecificProperty(data: HistoryData, propertyKey: string) {
  return data.map(({ timestamp, values }) => ({
    timestamp,
    value: values.find(({ key }) => key === propertyKey)
  }));
}

function takeFieldValue(property: Property | undefined, fieldKey: string) {
  if (property === undefined) return NaN;
  let value = NaN;
  const crtField = property.fields.find(({ key }) => key === fieldKey);
  if (crtField) value = roundValue(property.data[crtField.name], property.precision);
  return value;
}
