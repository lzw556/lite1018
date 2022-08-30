import { MeasurementRow } from '../summary/measurement/props';

export function sortMeasurementsByAttributes(measurements: MeasurementRow[]) {
  return measurements.sort((prev, next) => {
    const { index: prevIndex } = prev.attributes || { index: 8 };
    const { index: nextIndex } = next.attributes || { index: 8 };
    return prevIndex - nextIndex;
  });
}
