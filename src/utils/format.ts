import { round, floor, ceil } from 'lodash';
import dayjs from './dayjsUtils';

export const getFilename = (res: any) => {
  let filename = `${dayjs().format('YYYY-MM-DD HH:mm:ss')}.json`;
  const dispos = res.headers['content-disposition'];
  if (dispos) {
    const disposParts = dispos.split(';');
    if (disposParts && disposParts.length > 1) {
      const path = disposParts[1];
      const pathParts = path.split('filename=');
      if (pathParts && pathParts.length > 1) {
        filename = decodeURI(pathParts[1]);
      }
    }
  }
  return filename;
};

export function getDisplayValue(value: number | null | undefined, unit?: string) {
  if (Number.isNaN(value) || value === null || value === undefined) return '-';
  return `${value}${unit ?? ''}`;
}

export function roundValue(value: number, precision?: number) {
  if (Number.isNaN(value) || value === 0) return value;
  return round(value, precision ?? 3);
}

export function toMac(mac: string) {
  if (mac.length === 12) {
    return mac.replace(/\w(?=(\w{2})+$)/g, '$&-');
  }
  return mac;
}

export function getRangeOfValuedYAxis(
  actual: { min: number; max: number },
  precision: number,
  initial?: { min: number; max: number }
): {
  min?: number;
  max?: number;
} {
  const max = initial ? Math.max(actual.max, initial?.max) : actual.max;
  const min = initial ? Math.min(actual.min, initial?.min) : actual.min;
  const RATELIKELINE = 1 / 100;
  const total = max - min;
  const percentage = total / Math.abs(min);
  const isCloseToLine = percentage < RATELIKELINE;
  const lessMin = min - Math.abs(min) * percentage;
  const moreMax = max + Math.abs(max) * percentage;
  const actualPrecision =
    Number.isInteger(min) || Math.abs(min) + Math.abs(max) >= 5 ? 0 : precision;
  let finalMin = undefined,
    finalMax = undefined;
  if (isCloseToLine && total !== 0) {
    if (max > 0) {
      finalMin = floor(lessMin, actualPrecision);
    } else {
      finalMax = ceil(moreMax, actualPrecision);
    }
  }
  return { min: finalMin, max: finalMax };
}

export function getDurationByDays(days: number): {
  duration: number;
  unit: 'UNIT_DAY' | 'UNIT_YEAR';
} {
  if (days < 365) {
    return { duration: days, unit: 'UNIT_DAY' };
  }
  return { duration: floor(days / 365, 1), unit: 'UNIT_YEAR' };
}
