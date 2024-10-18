import React from 'react';
import intl from 'react-intl-universal';
import { Col, Empty, Row, Select, Space, Spin, Statistic } from 'antd';
import {
  getThicknessAnalysis,
  HistoryData,
  MonitoringPointRow,
  Point,
  ThicknessAnalysis
} from '../../../asset-common';
import { useLocaleContext } from '../../../../localeProvider';
import {
  oneYearNumberRange,
  oneYearRange,
  RangeDatePicker
} from '../../../../components/rangeDatePicker';
import { ColorDanger } from '../../../../constants/color';
import dayjs from '../../../../utils/dayjsUtils';
import { getDisplayName, getDurationByDays, getValue } from '../../../../utils/format';
import { PropertyChart, transformHistoryData } from '../../../../components/charts/propertyChart';

const DURATIONS = [
  {
    label: intl.get('PLEASE_SELECT_SOMETHING', { something: intl.get('TIMESTAMP') }),
    value: 'none' as 'none',
    color: ''
  },
  { label: intl.get('THICKNESS_ANALYSIS_ALL'), value: 'all' as 'all' },
  { label: intl.get('THICKNESS_ANALYSIS_1_MONTH'), value: 1 as 1 },
  { label: intl.get('THICKNESS_ANALYSIS_3_MONTHS'), value: 3 as 3 },
  { label: intl.get('THICKNESS_ANALYSIS_6_MONTHS'), value: 6 as 6 },
  { label: intl.get('THICKNESS_ANALYSIS_1_YEAR'), value: 12 as 12 }
];

type Duration = Exclude<typeof DURATIONS[number]['value'], 'none'>;

type AnalysisPart = {
  data: { name: Duration; x: number; y: number }[];
  rate: number;
  life: number;
};

export type AnalysisMap = Record<Duration, AnalysisPart>;

export type MarkLineData =
  | { name: string; yAxis?: number; lineStyle: {}; label: {} }
  | AnalysisPart['data'];

export const Analysis = (props: MonitoringPointRow) => {
  const { language } = useLocaleContext();
  const { id, attributes, properties, type } = props;
  const [loading, setLoading] = React.useState(true);
  const [analysisData, setAnalysisData] = React.useState<AnalysisMap | null>(null);
  const [range, setRange] = React.useState<[number, number]>(oneYearNumberRange);
  const defaultMarkLines = React.useMemo(() => {
    const lines = [];
    if (attributes?.critical_thickness && attributes?.critical_thickness_enabled) {
      lines.push({
        name: 'criticalThickness',
        yAxis: attributes?.critical_thickness,
        lineStyle: { color: ColorDanger },
        label: { formatter: intl.get('CRITICAL_THICKNESS') }
      });
    }
    if (attributes?.initial_thickness && attributes?.initial_thickness_enabled) {
      lines.push({
        name: 'intialThickness',
        yAxis: attributes?.initial_thickness,
        lineStyle: { color: 'rgb(0,130,252)' },
        label: { formatter: intl.get('INITIAL_THICKNESS') }
      });
    }
    return lines;
  }, [attributes]);
  const [selectedDuration, setSelectedDuration] = React.useState<Duration | 'none'>('none');
  const [historyData, setHistoryData] = React.useState<HistoryData>();

  function getData(id: number, range: [number, number]) {
    setLoading(true);
    getThicknessAnalysis(id, range[0], range[1])
      .then((data) => {
        console.log(data);
        setHistoryData(data.data);
        setAnalysisData(transformThicknessAnalysis(data));
      })
      .finally(() => setLoading(false));
  }

  React.useEffect(() => {
    if (range) {
      getData(id, range);
    }
  }, [id, range]);

  let dispatchActionOption: any;
  if (selectedDuration !== 'none' && analysisData) {
    const sub = analysisData[selectedDuration];
    if (sub && sub.data) {
      dispatchActionOption = {
        type: 'brush',
        areas: [
          {
            brushType: 'lineX',
            coordRange: sub.data.map(({ x }) =>
              dayjs.unix(x).local().format('YYYY-MM-DD HH:mm:ss')
            ),
            xAxisIndex: 0
          }
        ]
      };
    }
  }

  return (
    <Row gutter={[0, 16]}>
      <Col span={24}>
        <Space>
          <RangeDatePicker onChange={setRange} defaultRange={oneYearRange} />
          <Select
            defaultValue='none'
            style={{ width: '9em' }}
            onChange={(val: Duration | 'none') => {
              setSelectedDuration(val);
            }}
          >
            {DURATIONS.map(({ label, value }) => (
              <Select.Option key={value} value={value}>
                {label}
              </Select.Option>
            ))}
          </Select>
        </Space>
      </Col>
      <Col span={24}>{renderContent()}</Col>
    </Row>
  );

  function renderContent() {
    if (loading) return <Spin />;
    if (!historyData || historyData.length === 0) {
      return (
        <Col span={24}>
          <Empty description={intl.get('NO_DATA_PROMPT')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </Col>
      );
    }

    return (
      <Row gutter={[0, 16]}>
        <Col span={24}>{renderSummary()}</Col>
        <Col span={24}>{renderChart()}</Col>
      </Row>
    );
  }

  function renderSummary() {
    if (selectedDuration === 'none' || !analysisData) return null;
    const { rate, life } = analysisData[selectedDuration];
    const formattedLife = getDurationByDays(life);
    return (
      <Row align='bottom'>
        <Col span={6}>
          <Statistic
            title={getDisplayName({
              name: intl.get('FIELD_CORROSION_RATE'),
              lang: language,
              suffix: 'mm/a'
            })}
            value={getValue(rate)}
          />
        </Col>
        <Col span={6} offset={1}>
          <Statistic
            title={getDisplayName({
              name: intl.get('FIELD_RESIDUAL_LIFE'),
              lang: language,
              suffix: intl.get(formattedLife.unit)
            })}
            value={getValue(formattedLife.duration)}
          />
        </Col>
      </Row>
    );
  }

  function renderChart() {
    if (!historyData || historyData.length === 0) {
      return null;
    }
    const _properties = Point.getPropertiesByType(properties, type);
    if (_properties.length === 0) return null;
    const property = _properties[0];
    const transform = transformHistoryData(historyData, property);
    let markLineData: any = defaultMarkLines;
    if (
      analysisData &&
      selectedDuration !== 'none' &&
      analysisData[selectedDuration] &&
      analysisData[selectedDuration].data
    ) {
      const newLines = analysisData[selectedDuration].data
        .filter((m) => !!m && !Number.isNaN(m.y))
        .map((m, i) => {
          return {
            name: DURATIONS.find((d) => d.value === m.name)?.label,
            coord: [dayjs.unix(m.x).local().format('YYYY-MM-DD HH:mm:ss'), m.y],
            lineStyle: {
              width: 3,
              color: 'rgb(34,237,124)'
            }
          };
        });
      if (newLines.length > 0) {
        markLineData = [...defaultMarkLines, newLines];
      }
    }
    return (
      transform && (
        <PropertyChart
          rawOptions={{
            animation: false,
            toolbox: { show: false },
            brush: {
              toolbox: ['lineX', 'clear'],
              xAxisIndex: 0,
              transformable: false
            }
          }}
          series={transform.series.map((s) => ({
            ...s,
            raw: {
              markLine: {
                symbol: 'none',
                data: markLineData,
                label: {
                  distance: [-60, 0]
                }
              }
            }
          }))}
          style={{ height: 650 }}
          yAxis={property}
          dispatchActionOption={dispatchActionOption}
        />
      )
    );
  }
};

function transformThicknessAnalysis(origin: {
  data: HistoryData;
  analysisResult: ThicknessAnalysis;
}): AnalysisMap | null {
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

function compuleStartPoint(times: number[], interval?: 1 | 3 | 6 | 12) {
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
