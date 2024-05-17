import * as React from 'react';
import { getDataOfMonitoringPoint, getDynamicData, getDynamicDataVibration } from '../../services';
import { DataType } from '../../types';

export type DynamicDataType = {
  fields: { label: string; value: string; unit: string; precision: number }[];
  metaData: { label: string; value: string; unit: string; precision: number }[];
};

export type VibrationWaveFormDataType = {
  frequency: number;
  highEnvelopes: number[];
  lowEnvelopes: number[];
  values: number[];
  xAxis: number[];
  xAxisUnit: string;
  yAxisUnit: string;
};

export type Metadata = { [key: string]: number };

export interface PreloadWaveData {
  metadata: Metadata;
  tof: number[];
  mv: number[];
}

export interface PreloadDynamicData {
  metadata: Metadata;
  dynamic_length: number[];
  dynamic_tof: number[];
  dynamic_preload: number[];
  dynamic_pressure: number[];
  dynamic_acceleration: {
    xAxis: number;
    yAxis: number;
    zAxis: number;
  }[];
}

export interface ThicknessWaveData extends PreloadWaveData {}

export interface AngleDynamicData {
  metadata: Metadata;
  dynamic_displacement: number[];
  dynamic_displacement_radial: number[];
  dynamic_displacement_axial: number[];
  dynamic_displacement_ew: number[];
  dynamic_displacement_ns: number[];
  dynamic_direction: number[];
  dynamic_inclination_radial: number[];
  dynamic_inclination_axial: number[];
  dynamic_inclination_ew: number[];
  dynamic_inclination_ns: number[];
  dynamic_inclination: number[];
  dynamic_pitch: number[];
  dynamic_roll: number[];
  dynamic_waggle: number[];
}

export function useDynamicDataRequest<T>(
  id: number,
  dataType?: DataType,
  range?: [number, number],
  vibrationFilters?: { field: string; axis: number }
) {
  const [timestamps, setTimestamps] = React.useState<{
    dataType?: DataType;
    data: { timestamp: number }[];
  }>({ dataType, data: [] });
  const [loading, setLoading] = React.useState(true);
  const [timestamp, setTimestamp] = React.useState<{ dataType?: DataType; data: number }>();
  const [dynamicData, setDynamicData] = React.useState<{
    timestamp: number;
    values: T;
  }>();
  const [loading2, setLoading2] = React.useState(true);
  React.useEffect(() => {
    if (range && dataType) {
      const [from, to] = range;
      getDataOfMonitoringPoint(id, from, to, dataType).then((data) => {
        setTimestamps({ dataType, data });
        setLoading(false);
      });
    }
  }, [range, id, dataType]);

  React.useEffect(() => {
    if (timestamps.data.length > 0) {
      setTimestamp({ dataType: timestamps.dataType, data: timestamps.data[0].timestamp });
    } else {
      setTimestamp(undefined);
    }
  }, [timestamps]);

  React.useEffect(() => {
    if (timestamp && timestamp.dataType === dataType) {
      setLoading2(true);
      if (vibrationFilters) {
        getDynamicDataVibration<T>(id, timestamp.data, dataType, vibrationFilters).then((data) => {
          setDynamicData(data);
          setLoading2(false);
        });
      } else {
        getDynamicData<T>(id, timestamp.data, dataType).then((data) => {
          setDynamicData(data);
          setLoading2(false);
        });
      }
    }
  }, [id, timestamp, dataType, vibrationFilters]);

  return {
    all: { timestamps: timestamps.data, loading },
    selected: {
      timestamp: timestamp?.data,
      dynamicData: { values: dynamicData?.values, loading: loading2 },
      setTimestamp
    }
  };
}
