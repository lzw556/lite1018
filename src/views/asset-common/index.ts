import { resolveStatistics } from './utils/statistics';
import { AssetModel, AssetRow } from './types';
import { isWindRelated } from '../app-wind-turbine';
import { isArea, isCorrosionRelated, isVibrationRelated } from '../asset-variant';
import { isMonitoringPoint } from './monitoring-point';

export * from '../home/tree';
export * from './components';
export * from './monitoring-point';
export * from './constants';
export * from './services';
export * from './types';
export { generateProjectAlarmStatis } from './utils/statistics';

export const Asset = {
  resolveStatistics,
  Assert: {
    isArea,
    isWindRelated,
    isMonitoringPoint,
    isVibrationRelated,
    isCorrosionRelated
  },
  convert: (values?: AssetRow): AssetModel | null => {
    if (!values) return null;
    return {
      id: values.id,
      name: values.name,
      parent_id: values.parentId,
      type: values.type,
      attributes: values.attributes
    };
  }
};
