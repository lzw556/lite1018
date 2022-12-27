import * as Wind from './wind.config';
import * as Base from './base.config';
import { measurementTypes } from '../views/home/common/constants';

export function use(appCate: typeof window.assetCategory = 'default') {
  if (appCate === Wind.category) {
    return Wind;
  }
  return Base;
}

export function getMeasurementType(typeId: number) {
  return Object.values(measurementTypes).find((type) => type.id === typeId);
}

export function getMeasurementTypes(appCate: typeof window.assetCategory = 'default') {
  return use(appCate).ownerMeasurementTypes;
}
