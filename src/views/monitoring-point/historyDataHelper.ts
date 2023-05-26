import dayjs from '../../utils/dayjsUtils';
import { roundValue } from '../../utils/format';
import { ThicknessAnalysis } from './services';
import { generateChartOptionsOfHistoryDatas } from './show/monitor';
import { Analysis } from './show/thicknessAnalysis';
import { HistoryData, MonitoringPointTypeValue, Property } from './types';
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

export function transformThicknessAnalysis(
  origin: {
    data: HistoryData;
    analysisResult: ThicknessAnalysis;
  },
  propertyKey: string
): { options: any; analysis: Analysis } | null {
  if (!origin || !origin.data || origin.data.length === 0) return null;
  const { analysisResult } = origin;
  const options = generateChartOptionsOfHistoryDatas(
    origin.data,
    MonitoringPointTypeValue.THICKNESS,
    propertyKey
  );
  const times = origin.data.map(({ timestamp }) => timestamp);
  const end = times[times.length - 1];
  // algorithm: y = kx+b
  const data_1 = [compuleStartPoint(times, 1), end].map((x) => ({
    name: 1 as 1,
    x,
    y: analysisResult.k_1_month * x + analysisResult.b_1_month
  }));
  const data_3 = [compuleStartPoint(times, 3), end].map((x) => ({
    name: 3 as 3,
    x,
    y: analysisResult.k_3_months * x + analysisResult.b_3_months
  }));
  const data_6 = [compuleStartPoint(times, 6), end].map((x) => ({
    name: 6 as 6,
    x,
    y: analysisResult.k_6_months * x + analysisResult.b_6_months
  }));
  const data_12 = [compuleStartPoint(times, 12), end].map((x) => ({
    name: 12 as 12,
    x,
    y: analysisResult.k_1_year * x + analysisResult.b_1_year
  }));
  const data_all = [compuleStartPoint(times), end].map((x) => ({
    name: 'all' as 'all',
    x,
    y: analysisResult.k_all * x + analysisResult.b_all
  }));
  return {
    options,
    analysis: {
      1: {
        data: data_1,
        rate: analysisResult.corrosion_rate_1_month,
        life: analysisResult.residual_life_1_month
      },
      3: {
        data: data_3,
        rate: analysisResult.corrosion_rate_3_months,
        life: analysisResult.residual_life_3_months
      },
      6: {
        data: data_6,
        rate: analysisResult.corrosion_rate_6_months,
        life: analysisResult.residual_life_6_months
      },
      12: {
        data: data_12,
        rate: analysisResult.corrosion_rate_1_year,
        life: analysisResult.residual_life_1_year
      },
      all: {
        data: data_all,
        rate: analysisResult.corrosion_rate_all,
        life: analysisResult.residual_life_all
      }
    }
  };
}

export function compuleStartPoint(times: number[], interval?: 1 | 3 | 6 | 12) {
  const last = times[times.length - 1];
  if (interval) {
    const start = dayjs.unix(last).subtract(interval, 'month').unix();
    const selectedTime = times.find((t) => t === start);
    const nearest = closest(start, times);
    return selectedTime ?? nearest;
  }
  return times[0];
}

function closest(needle: number, haystack: number[]) {
  return haystack.reduce((a, b) => {
    let aDiff = Math.abs(a - needle);
    let bDiff = Math.abs(b - needle);
    if (aDiff === bDiff) {
      return a > b ? a : b;
    } else {
      return bDiff < aDiff ? b : a;
    }
  });
}
