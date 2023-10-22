import { cloneDeep } from 'lodash';
import dayjs from '../../utils/dayjsUtils';
import {
  MonitoringPoint,
  MonitoringPointRow,
  MonitoringPointTypeValue,
  MONITORING_POINT_TYPE_VALUE_DYNAMIC_MAPPING,
  Property,
  MonitoringPointTypeText,
  MONITORING_POINT_DISPLAY_PROPERTIES,
  HistoryData
} from './types';
import intl from 'react-intl-universal';
import { DisplayProperty } from '../../constants/properties';
import { ThicknessAnalysis } from './services';
import { Analysis } from './show/thicknessAnalysis';
import { pickDataOfFirstProperties } from '../device/util';
import { getDisplayName } from '../../utils/format';
import { Language } from '../../localeProvider';

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
    attributes: parseAttrs(values.attributes),
    channel: firstDevice?.channel === 0 ? 1 : firstDevice?.channel
  };
}

export function removeDulpicateProperties(properties: DisplayProperty[]) {
  const final = cloneDeep(properties);
  return final.map((property) => {
    const fields = property.fields;
    if (fields?.every((field) => field.key === property.key)) {
      return { ...property, fields: [] };
    } else {
      return property;
    }
  });
}

export function generateDatasOfMeasurement(measurement: MonitoringPointRow) {
  const properties = getDisplayProperties(measurement.properties, measurement.type).filter(
    (p) => p.first
  );
  const { data } = measurement;
  return pickDataOfFirstProperties(properties, data);
}

export function generatePropertyColumns(measurement: MonitoringPointRow, lang: Language) {
  const properties = generateDatasOfMeasurement(measurement);
  if (properties.length > 0) {
    return properties
      .map(({ name, key, fieldName }) => ({
        title: getDisplayName({
          name: intl.get(name),
          suffix: fieldName && intl.get(fieldName),
          lang
        }),
        key,
        render: (measurement: MonitoringPointRow) => {
          const datas = generateDatasOfMeasurement(measurement);
          return datas.find((data) => key === data.key)?.value;
        },
        width: 120
      }))
      .concat({
        title: intl.get('SAMPLING_TIME'),
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
    const { index: prevIndex } = prev.attributes || { index: 88 };
    const { index: nextIndex } = next.attributes || { index: 88 };
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

export function getProcessId({
  monitoringPointType,
  isChannel
}: {
  monitoringPointType?: number;
  isChannel?: boolean;
}) {
  if (isChannel) {
    return 2;
  }
  if (monitoringPointType === MonitoringPointTypeValue.THICKNESS) {
    return 11;
  }
  if (
    monitoringPointType === MonitoringPointTypeValue.TOWER_INCLINATION ||
    monitoringPointType === MonitoringPointTypeValue.TOWER_BASE_SETTLEMENT
  ) {
    return 21;
  }
  return 1;
}

export function getMonitoringPointType(type: number) {
  for (const key in MonitoringPointTypeValue) {
    if (!Number.isNaN(Number(key)) && type === Number(key)) {
      const _key: keyof typeof MonitoringPointTypeValue = MonitoringPointTypeValue[
        key
      ] as keyof typeof MonitoringPointTypeValue;
      return MonitoringPointTypeText[_key];
    }
  }
}

export const buildRequestAttrs = (attributes: any, oldAttrs?: any) => {
  if (attributes) {
    const { critical_thickness, initial_thickness, ...rest } = attributes;
    let attr = { ...rest };
    if (critical_thickness) {
      attr = {
        ...attr,
        critical_thickness_enabled: critical_thickness.enabled
      };
      if (critical_thickness.value) {
        attr = { ...attr, critical_thickness: critical_thickness.value };
      } else if (oldAttrs && oldAttrs.critical_thickness) {
        attr = { ...attr, critical_thickness: oldAttrs.critical_thickness };
      }
    }
    if (initial_thickness) {
      attr = {
        ...attr,
        initial_thickness_enabled: initial_thickness.enabled
      };
      if (initial_thickness.value) {
        attr = { ...attr, initial_thickness: initial_thickness.value };
      } else if (oldAttrs && oldAttrs.initial_thickness) {
        attr = { ...attr, initial_thickness: oldAttrs.initial_thickness };
      }
    }
    return attr;
  }
  return attributes;
};

export const parseAttrs = (attributes: MonitoringPointRow['attributes']) => {
  let attr = null;
  if (attributes) {
    const {
      critical_thickness,
      critical_thickness_enabled,
      initial_thickness,
      initial_thickness_enabled,
      ...rest
    } = attributes;
    attr = { ...rest };
    if (critical_thickness) {
      attr = {
        ...attr,
        critical_thickness: {
          enabled: critical_thickness_enabled,
          value: critical_thickness
        }
      };
    }
    if (initial_thickness) {
      attr = {
        ...attr,
        initial_thickness: {
          enabled: initial_thickness_enabled,
          value: initial_thickness
        }
      };
    }
  }

  return attr ?? attributes;
};

export function getDisplayProperties(
  properties: Property[],
  monitoringPointType: MonitoringPointTypeValue,
  filters?: Property[]
) {
  const dispalyPropertiesSettings =
    MONITORING_POINT_DISPLAY_PROPERTIES[
      monitoringPointType as keyof typeof MONITORING_POINT_DISPLAY_PROPERTIES
    ];
  if (!dispalyPropertiesSettings || dispalyPropertiesSettings.length === 0) {
    return properties.sort((prev, crt) => prev.sort - crt.sort) as DisplayProperty[];
  } else if (filters && filters.length > 0) {
    return filters as DisplayProperty[];
  } else {
    return dispalyPropertiesSettings
      .filter((p) => !p.losingOnMonitoringPoint)
      .map((p) => {
        const remote = properties.find((r) =>
          p.parentKey ? r.key === p.parentKey : r.key === p.key
        );
        return {
          ...p,
          fields:
            p.fields ??
            remote?.fields
              ?.filter((f) => (p.parentKey ? f.key === p.key : true))
              .map((f, i) => ({
                ...f,
                first: p.defaultFirstFieldKey
                  ? f.key === p.defaultFirstFieldKey
                  : i === remote?.fields.length - 1
              }))
        };
      })
      .filter((p) => !!p.fields) as DisplayProperty[];
  }
}

export function transformThicknessAnalysis(origin: {
  data: HistoryData;
  analysisResult: ThicknessAnalysis;
}): Analysis | null {
  if (!origin || !origin.data || !origin.analysisResult) return null;
  const { analysisResult } = origin;
  const {
    k_1_month,
    b_1_month,
    corrosion_rate_1_month,
    residual_life_1_month,
    k_3_months,
    b_3_months,
    corrosion_rate_3_months,
    residual_life_3_months,
    k_6_months,
    b_6_months,
    corrosion_rate_6_months,
    residual_life_6_months,
    k_1_year,
    b_1_year,
    corrosion_rate_1_year,
    residual_life_1_year,
    k_all,
    b_all,
    corrosion_rate_all,
    residual_life_all
  } = analysisResult;
  const times = origin.data.map(({ timestamp }) => timestamp);
  const end = times[times.length - 1];
  // algorithm: y = kx+b
  const data_1 = [compuleStartPoint(times, 1), end].map((x) => ({
    name: 1 as 1,
    x,
    y: k_1_month * x + b_1_month
  }));
  const data_3 = [compuleStartPoint(times, 3), end].map((x) => ({
    name: 3 as 3,
    x,
    y: k_3_months * x + b_3_months
  }));
  const data_6 = [compuleStartPoint(times, 6), end].map((x) => ({
    name: 6 as 6,
    x,
    y: k_6_months * x + b_6_months
  }));
  const data_12 = [compuleStartPoint(times, 12), end].map((x) => ({
    name: 12 as 12,
    x,
    y: k_1_year * x + b_1_year
  }));
  const data_all = [compuleStartPoint(times), end].map((x) => ({
    name: 'all' as 'all',
    x,
    y: k_all * x + b_all
  }));
  return {
    1: {
      data: data_1,
      rate: corrosion_rate_1_month,
      life: residual_life_1_month
    },
    3: {
      data: data_3,
      rate: corrosion_rate_3_months,
      life: residual_life_3_months
    },
    6: {
      data: data_6,
      rate: corrosion_rate_6_months,
      life: residual_life_6_months
    },
    12: {
      data: data_12,
      rate: corrosion_rate_1_year,
      life: residual_life_1_year
    },
    all: {
      data: data_all,
      rate: corrosion_rate_all,
      life: residual_life_all
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
