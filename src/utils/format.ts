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
