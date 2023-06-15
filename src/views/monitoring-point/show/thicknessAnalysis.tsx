import { Col, Empty, Row, Select, Space, Spin, Statistic } from 'antd';
import React from 'react';
import intl from 'react-intl-universal';
import { RangeDatePicker, oneYearRange } from '../../../components/rangeDatePicker';
import { ChartContainer } from '../../../components/charts/chartContainer';
import { ColorDanger } from '../../../constants/color';
import { MonitoringPointRow } from '../types';
import { getThicknessAnalysis } from '../services';
import { transformThicknessAnalysis } from '../historyDataHelper';
import dayjs from '../../../utils/dayjsUtils';
import { getDurationByDays } from '../../../utils/format';

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
  const { id, attributes } = props;
  const [loading, setLoading] = React.useState(true);
  const [analysisData, setAnalysisData] = React.useState<{
    options: any;
    analysis: Analysis;
  } | null>(null);
  const [range, setRange] = React.useState<[number, number]>();
  const defaultMarkLines = React.useMemo(() => {
    const lines = [];
    if (attributes?.critical_thickness?.enabled && attributes?.critical_thickness.value) {
      lines.push({
        name: 'criticalThickness',
        yAxis: attributes?.critical_thickness.value,
        lineStyle: { color: ColorDanger },
        label: { formatter: intl.get('CRITICAL_THICKNESS') }
      });
    }
    if (attributes?.initial_thickness?.enabled && attributes?.initial_thickness.value) {
      lines.push({
        name: 'intialThickness',
        yAxis: attributes?.initial_thickness.value,
        lineStyle: { color: 'rgb(0,130,252)' },
        label: { formatter: intl.get('INITIAL_THICKNESS') }
      });
    }
    return lines;
  }, [attributes]);
  const [markLineDatas, setMarkLineDatas] = React.useState<MarkLineData[]>(defaultMarkLines);
  const [selectedDuration, setSelectedDuration] = React.useState<Duration | 'none'>('none');

  const instance = React.useRef<any>(null);

  function getData(id: number, range: [number, number]) {
    setLoading(true);
    getThicknessAnalysis(id, range[0], range[1])
      .then((data) => {
        console.log(data);
        setAnalysisData(transformThicknessAnalysis(data, 'thickness'));
      })
      .finally(() => setLoading(false));
  }

  React.useEffect(() => {
    if (range) {
      getData(id, range);
      setMarkLineDatas(defaultMarkLines);
    }
  }, [id, range, defaultMarkLines]);

  React.useEffect(() => {
    if (selectedDuration !== 'none') {
      if (analysisData) {
        setMarkLineDatas([
          ...defaultMarkLines,
          analysisData.analysis[selectedDuration as Duration].data
        ]);
      }
    } else {
      setMarkLineDatas(defaultMarkLines);
    }
  }, [selectedDuration, analysisData, defaultMarkLines]);

  React.useEffect(() => {
    const datas = markLineDatas.filter((m) => Array.isArray(m));
    if (datas.length > 0) {
      const data = datas[0] as AnalysisPart['data'];
      if (instance && instance.current) {
        instance.current.getEchartsInstance().dispatchAction({
          type: 'brush',
          areas: [
            {
              brushType: 'lineX',
              coordRange: data.map(({ x }) => dayjs.unix(x).local().format('YYYY-MM-DD HH:mm:ss')),
              xAxisIndex: 0
            }
          ]
        });
      }
    }
  }, [markLineDatas]);

  function renderContent() {
    if (loading) return <Spin />;
    if (!analysisData || !analysisData.options) {
      return (
        <Col span={24}>
          <Empty description={intl.get('NO_DATA_PROMPT')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </Col>
      );
    }

    return (
      <Row gutter={[0, 16]}>
        <Col span={24}>{renderSummary()}</Col>
        <Col span={24}>
          {analysisData.options.map((o: any) => (
            <ChartContainer
              key={o.title}
              title=''
              style={{ height: 500 }}
              options={{
                ...o,
                toolbox: { show: false },
                brush: {
                  toolbox: ['lineX', 'clear'],
                  xAxisIndex: 0,
                  transformable: false
                },
                yAxis: {
                  axisLabel: {
                    formatter: (val: number) => (Number.isInteger(val) ? val : val.toFixed(3))
                  },
                  min: (values: { min: number; max: number }) => {
                    return getRangeOfYAxis(values, attributes).min;
                  },
                  max: (values: { min: number; max: number }) => {
                    return getRangeOfYAxis(values, attributes).max;
                  }
                },
                series: o.series.map((s: any) => ({
                  ...s,
                  symbol: 'none',
                  areaStyle: null,
                  markLine: {
                    symbol: 'none',
                    data: markLineDatas.map((m, i) => {
                      if (Array.isArray(m)) {
                        return m.map((item) => ({
                          name: DURATIONS.find((d) => d.value === item.name)?.label,
                          coord: [dayjs.unix(item.x).local().format('YYYY-MM-DD HH:mm:ss'), item.y],
                          lineStyle: {
                            width: 3,
                            color: 'rgb(34,237,124)'
                          },
                          label: {
                            distance: [-50 * i, 0]
                          }
                        }));
                      } else {
                        return m;
                      }
                    })
                  }
                }))
              }}
              instanceRef={instance}
            />
          ))}
        </Col>
      </Row>
    );
  }

  function renderSummary() {
    const lines = markLineDatas.filter((m) => Array.isArray(m));
    if (lines.length === 0) return null;
    return lines.map((m, i) => {
      const duration = (m as AnalysisPart['data'])[0].name;
      const { rate, life } = analysisData!.analysis[duration];
      const formattedLife = getDurationByDays(life);
      return (
        <Row align='bottom'>
          <Col span={6}>
            <Statistic
              title={i === 0 ? `${intl.get('FIELD_CORROSION_RATE')}(mm/a)` : ' '}
              value={rate}
            />
          </Col>
          <Col span={6} offset={1}>
            <Statistic
              title={
                i === 0
                  ? `${intl.get('FIELD_RESIDUAL_LIFE')}(${intl.get(formattedLife.unit)})`
                  : ' '
              }
              value={formattedLife.duration}
            />
          </Col>
        </Row>
      );
    });
  }

  return (
    <Row gutter={[0, 16]}>
      <Col span={24}>
        <Space>
          <RangeDatePicker
            onChange={React.useCallback((range: [number, number]) => setRange(range), [])}
            defaultRange={oneYearRange}
          />
          <Select
            defaultValue='none'
            style={{ width: '9em' }}
            onChange={(val: Duration | 'none') => setSelectedDuration(val)}
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
};

function getRangeOfYAxis(
  values: { min: number; max: number },
  attributes: MonitoringPointRow['attributes']
) {
  let min = values.min;
  let max = values.max;
  if (attributes?.initial_thickness?.enabled && attributes?.initial_thickness?.value) {
    min = Math.min(min, attributes?.initial_thickness?.value);
    max = Math.max(max, attributes?.initial_thickness?.value);
  }
  if (attributes?.critical_thickness?.enabled && attributes?.critical_thickness?.value) {
    min = Math.min(min, attributes?.critical_thickness?.value);
    max = Math.max(max, attributes?.critical_thickness?.value);
  }
  return { min: min - Math.abs(max - min) * 0.05, max: max + Math.abs(max - min) * 0.05 };
}
