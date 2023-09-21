import { Col, Empty, Row, Select, Space, Spin, Statistic } from 'antd';
import React from 'react';
import intl from 'react-intl-universal';
import {
  RangeDatePicker,
  oneYearNumberRange,
  oneYearRange
} from '../../../components/rangeDatePicker';
import { ColorDanger } from '../../../constants/color';
import { HistoryData, MonitoringPointRow } from '../types';
import { getThicknessAnalysis } from '../services';
import dayjs from '../../../utils/dayjsUtils';
import { getDurationByDays, getDisplayName, getValue } from '../../../utils/format';
import { PropertyChart, transformHistoryData } from '../../../components/charts/propertyChart';
import { getDisplayProperties, transformThicknessAnalysis } from '../utils';
import { useLocaleContext } from '../../../localeProvider';

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

export type Analysis = Record<Duration, AnalysisPart>;

export type MarkLineData =
  | { name: string; yAxis?: number; lineStyle: {}; label: {} }
  | AnalysisPart['data'];

export const ThicknessAnalysis = (props: MonitoringPointRow) => {
  const { language } = useLocaleContext();
  const { id, attributes, properties, type } = props;
  const [loading, setLoading] = React.useState(true);
  const [analysisData, setAnalysisData] = React.useState<Analysis | null>(null);
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
  const chartInstanceRef = React.useRef<any>();

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

  React.useEffect(() => {
    if (selectedDuration !== 'none' && analysisData) {
      const sub = analysisData[selectedDuration];
      if (sub && sub.data)
        chartInstanceRef.current.getEchartsInstance().dispatchAction({
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
        });
    }
  }, [selectedDuration, analysisData]);

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
    const _properties = getDisplayProperties(properties, type);
    if (_properties.length === 0) return null;
    const property = _properties[0];
    const { precision, unit } = property;
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
          style={{ height: 500 }}
          yAxisMinInterval={property.interval}
          yAxisValueMeta={{ unit, precision }}
          ref={chartInstanceRef}
        />
      )
    );
  }
};
