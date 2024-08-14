import React from 'react';
import intl from 'react-intl-universal';
import { oneWeekNumberRange } from '../../../components/rangeDatePicker';
import dayjs from '../../../utils/dayjsUtils';
import {
  getDynamicDataVibration,
  getMeasurement,
  getMeasurements,
  getTrend,
  TrendData
} from '../services';

type Range = [number, number];

type TrendProps = {
  activeKey: string;
  id: number;
  properties: Property[];
  setProperties: React.Dispatch<React.SetStateAction<Property[]>>;
  range: Range;
  setRange: React.Dispatch<React.SetStateAction<Range>>;
  trendData: {
    loading: boolean;
    data: TrendData[] | undefined;
    setData: React.Dispatch<React.SetStateAction<TrendData[] | undefined>>;
  };
  seriesOpts: any;
  timestamps: { label: string; value: number; selected?: boolean }[];
  title: string;
};

function useDateRange() {
  const [range, setRange] = React.useState<Range>(oneWeekNumberRange);
  return { range, setRange };
}

export type Property = {
  label: string;
  value: 'acceleration' | 'velocity' | 'displacement';
  selected?: boolean;
  unit?: string;
};

const SVT_OPTIONS: Property[] = [
  { label: 'FIELD_ACCELERATION', value: 'acceleration', selected: true, unit: 'm/s²' },
  { label: 'FIELD_VELOCITY', value: 'velocity', unit: 'mm/s' },
  { label: 'FIELD_DISPLACEMENT', value: 'displacement', unit: 'μm' }
];

function useProperties() {
  const options: Property[] = SVT_OPTIONS;
  const [properties, setProperties] = React.useState<Property[]>(options);
  return { properties, setProperties };
}

function useFetchingTrendData(id: number, range: Range) {
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<TrendProps['trendData']['data']>([]);
  const [from, to] = range;

  React.useEffect(() => {
    setLoading(true);
    getTrend(id, from, to)
      .then((data) => {
        if (data) {
          setData(data.map((d, i) => ({ ...d, selected: i === data.length - 1 })));
        }
      })
      .finally(() => setLoading(false));
  }, [id, from, to]);

  return { loading, data, setData };
}

export function useTrendProps(id: number) {
  const title = 'TREND';
  const { range, setRange } = useDateRange();
  const { properties, setProperties } = useProperties();
  const property = properties.find((p) => !!p.selected);
  const trendData = useFetchingTrendData(id, range);
  let seriesOpts = null;
  let timestamps: TrendProps['timestamps'] = [];
  const { data } = trendData;
  if (data) {
    if (data.length > 0 && property) {
      const xAxisValues = data.map(({ timestamp }) =>
        dayjs.unix(timestamp).local().format('YYYY-MM-DD HH:mm:ss')
      );
      const x = data.map(({ values }) => values[`${property.value}XRMS`]);
      const y = data.map(({ values }) => values[`${property.value}YRMS`]);
      const z = data.map(({ values }) => values[`${property.value}ZRMS`]);
      seriesOpts = [
        {
          data: { [intl.get(AXIS_OPTIONS[0].label)]: x },
          xAxisValues
        },
        {
          data: { [intl.get(AXIS_OPTIONS[1].label)]: y },
          xAxisValues
        },
        {
          data: { [intl.get(AXIS_OPTIONS[2].label)]: z },
          xAxisValues
        }
      ];
    }
    timestamps = [...data]
      .sort((d1, d2) => d2.timestamp - d1.timestamp)
      .map(({ timestamp, selected }) => ({
        label: dayjs.unix(timestamp).local().format('YYYY-MM-DD HH:mm:ss'),
        value: timestamp,
        selected
      }));
  }
  return {
    properties,
    setProperties,
    range,
    setRange,
    trendData,
    seriesOpts,
    timestamps,
    title
  };
}

function useSubProperties() {
  const options: Property[] = SVT_OPTIONS;
  const [subProperties, setSubProperties] = React.useState(options);
  return { subProperties, setSubProperties };
}

export type Axis = { label: string; value: number; selected?: boolean };

const AXIS_OPTIONS: Axis[] = [
  { label: 'FIELD_DISPLACEMENT_AXIAL', value: 0, selected: true },
  { label: 'HORIZONTAL', value: 1 },
  { label: 'FIELD_DISPLACEMENT_RADIAL', value: 2 }
];

function useAxis() {
  const [axies, setAxies] = React.useState(AXIS_OPTIONS);
  return { axies, setAxies };
}

type SubProps = {
  sub: {
    axies: Axis[];
    setAxies: React.Dispatch<React.SetStateAction<Axis[]>>;
    subProperties: Property[];
    setSubProperties: React.Dispatch<React.SetStateAction<Property[]>>;
  };
};

export function useSubProps(): SubProps {
  return { sub: { ...useSubProperties(), ...useAxis() } };
}

export type OriginalDomainResponse = {
  loading: boolean;
  values?: number[];
  xAxis?: number[];
};

export function useOriginalDomainResult() {
  const [originalDomain, setOriginalDomain] = React.useState<OriginalDomainResponse>({
    loading: true
  });
  return { originalDomain, setOriginalDomain };
}

export function useFetchingOriginalDomain(
  id: number | undefined,
  timestamp: number | undefined,
  axis: number | undefined,
  setOriginalDomain?: React.Dispatch<React.SetStateAction<OriginalDomainResponse>>
) {
  const [origin, setOrigin] = React.useState<OriginalDomainResponse>({ loading: true });
  React.useEffect(() => {
    if (id !== undefined && timestamp !== undefined && axis !== undefined) {
      setOriginalDomain?.((prev) => ({ ...prev, loading: true }));
      setOrigin((prev) => ({ ...prev, loading: true }));
      getDynamicDataVibration<OriginalDomainResponse>(id, timestamp, 'raw', {
        field: 'originalDomain',
        axis: axis
      })
        .then((data) => {
          if (data && data.values.xAxis && data.values.values) {
            setOriginalDomain?.((prev) => ({ ...prev, ...data.values }));
            setOrigin?.((prev) => ({ ...prev, ...data.values }));
          }
        })
        .finally(() => {
          setOriginalDomain?.((prev) => ({ ...prev, loading: false }));
          setOrigin((prev) => ({ ...prev, loading: false }));
        });
    } else {
      setOriginalDomain?.({ loading: false });
      setOrigin({ loading: false });
    }
  }, [id, timestamp, axis, setOriginalDomain]);
  return origin;
}

export const AnalysisContext = React.createContext<
  TrendProps &
    SubProps & {
      originalDomain: OriginalDomainResponse;
      setOriginalDomain: React.Dispatch<React.SetStateAction<OriginalDomainResponse>>;
    }
>(null!);

function useFetchingPoints(id: number) {
  const [points, setPoints] =
    React.useState<{ label: string; value: number; selected?: boolean }[]>();
  React.useEffect(() => {
    getMeasurement(id)
      .then((point) => getMeasurements({ asset_id: point.assetId }))
      .then((ps) =>
        setPoints(ps.map((p) => ({ label: p.name, value: p.id, selected: p.id === id })))
      );
  }, [id]);
  return { points, setPoints };
}

export function useCrossComparison(id: number) {
  const { points, setPoints } = useFetchingPoints(id);
  const selectedPointId = points?.find((p) => !!p.selected)?.value;
  const trendProps = useTrendProps(selectedPointId!);
  const subProps = useSubProps();
  return { points, setPoints, trendProps, subProps };
}

export type ChartSettings = {
  fs: number;
  full_scale: number;
  range: number;
  window?: string;
  cutoff_range_low?: number;
  cutoff_range_high?: number;
  filter_type?: number;
  filter_order?: number;
  f_h?: number;
  f_l?: number;
  scale?: number;
  window_length?: number;
};

export const defaultChartSettings: ChartSettings = {
  fs: 25641,
  full_scale: 16777215,
  range: 50,
  window: 'none',
  cutoff_range_low: 5,
  cutoff_range_high: 100,
  filter_type: 2,
  filter_order: 100,
  scale: 8,
  f_h: 2000,
  f_l: 1000,
  window_length: 1024
};
export type ChartSettingsItem = {
  label?: string;
  name?: keyof ChartSettings;
  options?: { label: string; value: number | string }[];
  hidden?: boolean;
};
export type ChartSettingsRangeItem = {
  label?: string;
  range: [ChartSettingsItem, ChartSettingsItem];
};

const window: ChartSettingsItem = {
  label: 'chart.window',
  name: 'window',
  options: [
    { label: 'chart.window.none', value: 'none' },
    { label: 'chart.window.rectangle', value: 'rectangle' },
    { label: 'chart.window.hamming', value: 'hamming' },
    { label: 'chart.window.hanning', value: 'hanning' },
    { label: 'chart.window.triangular', value: 'triangular' },
    { label: 'chart.window.blackman', value: 'blackman' },
    { label: 'chart.window.kaiser', value: 'kaiser' },
    { label: 'chart.window.chebwin', value: 'chebwin' },
    { label: 'chart.window.bartlett', value: 'bartlett' },
    { label: 'chart.window.flattop', value: 'flattop' }
  ]
};
const window_length: ChartSettingsItem = {
  label: 'chart.window.length',
  name: 'window_length',
  options: [128, 256, 512, 1024, 2048, 4096, 8192].map((n) => ({
    label: `chart.window.length.${n}`,
    value: n
  }))
};
const f_h: ChartSettingsItem = { name: 'f_h' };
const f_l: ChartSettingsItem = { name: 'f_l' };
const filter_order: ChartSettingsItem = {
  label: 'chart.filter.order',
  name: 'filter_order'
};
const filter_type: ChartSettingsItem = {
  label: 'chart.filter.type',
  name: 'filter_type',
  options: [
    { label: 'chart.filter.type.high', value: 0 },
    { label: 'chart.filter.type.low', value: 1 },
    { label: 'chart.filter.type.band', value: 2 }
  ]
};
const cutoff_range_low: ChartSettingsItem = {
  label: 'cutoff.range.low',
  name: 'cutoff_range_low'
};
const cutoff_range_high: ChartSettingsItem = {
  label: 'cutoff.range.high',
  name: 'cutoff_range_high'
};

type CutoffRange = [low: number, high: number];
type SetCutoffRange = ([low, high]: CutoffRange) => void;
type SetCutoffRangeHidden = ([low, high]: [low: boolean, high: boolean]) => void;

export const useChartSettingsItems = (
  key: string,
  setCutoffRange: SetCutoffRange,
  initial: CutoffRange
) => {
  const items: (ChartSettingsItem | ChartSettingsRangeItem)[] = [];
  const [cutoffRangeHidden, SetCutoffRangeHidden] = React.useState(getHiddenOfRange(initial));
  const filterTypeRelatedFields = useFilterTypeRelatedFields(
    setCutoffRange,
    SetCutoffRangeHidden,
    initial
  );
  const [low, high] = cutoffRangeHidden;
  switch (key) {
    case 'timeEnvelope':
    case 'envelope':
      items.push(window);
      items.push(...filterTypeRelatedFields);
      if (low === false && high === false) {
        items.push({ range: [cutoff_range_low, cutoff_range_high] });
      } else {
        items.push({
          ...cutoff_range_low,
          hidden: low
        });
        items.push({
          ...cutoff_range_high,
          hidden: high
        });
      }
      items.push(filter_order);
      break;
    case 'power':
    case 'cross':
    case 'cepstrum':
      items.push(window);
      break;
    case 'zoom':
      items.push(window);
      items.push({ label: 'zoom.frequency.range', range: [f_l, f_h] });
      break;
    case 'timeFrequency':
      items.push(window_length);
      break;
    default:
      break;
  }
  return items;
};

const useFilterTypeRelatedFields = (
  setCutoffRange: SetCutoffRange,
  SetCutoffRangeHidden: SetCutoffRangeHidden,
  initial: CutoffRange
) => {
  const [type, setType] = React.useState(2);
  const filterTypeField = {
    ...filter_type,
    onChange: (val: number) => {
      setType(val);
      setCutoffRange(initial);
      if (val === 0) {
        SetCutoffRangeHidden([false, true]);
      } else if (val === 1) {
        SetCutoffRangeHidden([true, false]);
      } else if (val === 2) {
        const [low, high] = initial;
        const hidden =
          (low === 5 && high === 100) ||
          (low === 50 && high === 1000) ||
          (low === 500 && high === 12820) ||
          (low === 1 && high === 12820);
        SetCutoffRangeHidden([hidden, hidden]);
      }
    }
  };
  const frequencyBand = useFrequencyBand(setCutoffRange, SetCutoffRangeHidden, initial);
  return type === 2 ? [filterTypeField, frequencyBand] : [filterTypeField];
};

const useFrequencyBand = (
  setCutoffRange: SetCutoffRange,
  SetCutoffRangeHidden: SetCutoffRangeHidden,
  initial: CutoffRange
) => {
  return {
    label: 'frequency.band',
    options: [
      { label: 'frequency.band.5-100Hz', value: 1 },
      { label: 'frequency.band.50-1000Hz', value: 2 },
      { label: 'frequency.band.500-12820Hz', value: 3 },
      { label: 'full.frequency.band', value: 4 },
      { label: 'custom.frequency.band', value: 5 }
    ],
    onChange: (val: number) => {
      SetCutoffRangeHidden([true, true]);
      if (val === 1) {
        setCutoffRange([5, 100]);
      } else if (val === 2) {
        setCutoffRange([50, 1000]);
      } else if (val === 3) {
        setCutoffRange([500, 12820]);
      } else if (val === 4) {
        setCutoffRange([1, 12820]);
      } else if (val === 5) {
        setCutoffRange(initial);
        SetCutoffRangeHidden([false, false]);
      }
    },
    defaultValue: mapRangeToOptionValue(initial)
  };
};

const mapRangeToOptionValue = (cutoffRange: CutoffRange) => {
  const [low, high] = cutoffRange;
  if (low === 5 && high === 100) {
    return 1;
  } else if (low === 50 && high === 1000) {
    return 2;
  } else if (low === 500 && high === 12820) {
    return 3;
  } else if (low === 1 && high === 12820) {
    return 4;
  } else {
    return 5;
  }
};

const getHiddenOfRange = (cutoffRange: CutoffRange) => {
  const value = mapRangeToOptionValue(cutoffRange);
  return value === 5 ? [false, false] : [true, true];
};
