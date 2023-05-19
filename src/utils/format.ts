import { round } from 'lodash';
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

export function computeScale(datas: number[], precision: number) {
  const nums = datas
    .filter((n) => n != null && !Number.isNaN(n))
    .map((n) => roundValue(n, precision));
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const getLeftData = (min: number, max: number) => {
    const diff = max - min;
    const increment = diff / 2;
    const decrement = diff * 1.5;
    const lessMin = min >= 0 && min - decrement < 0 ? 0 : min - decrement;
    return {
      max: max + increment,
      min: lessMin,
      interval: (max + increment - lessMin) / 5,
      axisLabel: {
        formatter: (val: number) => (Number.isInteger(val) ? val : val.toFixed(precision))
      }
    };
  };
  return min === max ? null : getLeftData(min, max);
}
