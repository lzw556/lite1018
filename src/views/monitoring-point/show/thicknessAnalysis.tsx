import { Checkbox, Col, Empty, Row, Spin, Statistic } from 'antd';
import React from 'react';
import intl from 'react-intl-universal';
import { RangeDatePicker } from '../../../components/rangeDatePicker';
import { ChartContainer } from '../../../components/charts/chartContainer';
import { ColorDanger } from '../../../constants/color';
import { MonitoringPointRow } from '../types';
import { getThicknessAnalysis } from '../services';
import { transformThicknessAnalysis } from '../historyDataHelper';
import dayjs from '../../../utils/dayjsUtils';

const DURATIONS = [
  { label: intl.get('THICKNESS_ANALYSIS_ALL'), value: 'all' as 'all', color: '#73c0de' },
  { label: intl.get('THICKNESS_ANALYSIS_1_MONTH'), value: 1 as 1, color: '#5470c6' },
  { label: intl.get('THICKNESS_ANALYSIS_3_MONTHS'), value: 3 as 3, color: '#91cc75' },
  { label: intl.get('THICKNESS_ANALYSIS_6_MONTHS'), value: 6 as 6, color: '#fac858' },
  { label: intl.get('THICKNESS_ANALYSIS_1_YEAR'), value: 12 as 12, color: 'rgb(34,237,124)' }
];

type Duration = typeof DURATIONS[number]['value'];

type AnalysisPart = {
  data: { name: Duration; x: number; y: number }[];
  rate: number;
  life: number;
};

export type Analysis = Record<Duration, AnalysisPart>;

export type MarkLineData = { name: string } | AnalysisPart['data'];

export const ThicknessAnalysis = (props: MonitoringPointRow) => {
  const { id, attributes } = props;
  const [loading, setLoading] = React.useState(true);
  const [analysisData, setAnalysisData] = React.useState<{
    options: any;
    analysis: Analysis;
  } | null>(null);
  const [range, setRange] = React.useState<[number, number]>();
  const defaultMarkLines = React.useRef([
    {
      name: 'intialThickness',
      yAxis: attributes?.initial_thickness,
      lineStyle: { color: 'rgb(0,130,252)' },
      label: { formatter: intl.get('INITIAL_THICKNESS') }
    },
    {
      name: 'criticalThickness',
      yAxis: attributes?.critical_thickness,
      lineStyle: { color: ColorDanger },
      label: { formatter: intl.get('CRITICAL_THICKNESS') }
    }
  ]);
  const [markLineDatas, setMarkLineDatas] = React.useState<MarkLineData[]>(
    defaultMarkLines.current
  );
  function getData(id: number, range: [number, number]) {
    setLoading(true);
    getThicknessAnalysis(id, range[0], range[1])
      .then((data) => {
        setAnalysisData(transformThicknessAnalysis(data, 'thickness'));
      })
      .finally(() => setLoading(false));
  }

  React.useEffect(() => {
    if (range) {
      getData(id, range);
      setMarkLineDatas(defaultMarkLines.current);
    }
  }, [id, range, defaultMarkLines]);

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
        <Col span={24}>
          <Checkbox.Group
            options={DURATIONS.map(({ label, value, color }) => ({
              value,
              label: (
                <Row align='middle'>
                  <Col>{label}</Col>
                  <Col>
                    <span
                      style={{
                        display: 'block',
                        marginLeft: 5,
                        height: 16,
                        width: 16,
                        backgroundColor: color
                      }}
                    ></span>
                  </Col>
                </Row>
              )
            }))}
            onChange={(checked) => {
              setMarkLineDatas([
                ...defaultMarkLines.current,
                ...checked.map((c) => analysisData.analysis[c as Duration].data)
              ]);
            }}
          />
        </Col>
        <Col span={24}>
          <Row>
            <Col span={18}>
              {analysisData.options.map((o: any) => (
                <ChartContainer
                  key={o.title}
                  title=''
                  style={{ height: 500 }}
                  options={{
                    ...o,
                    yAxis: {
                      min: ({ min }: { min: number; max: number }) => {
                        if (attributes?.initial_thickness && attributes.critical_thickness) {
                          return (
                            Math.min(
                              min,
                              attributes?.initial_thickness,
                              attributes?.critical_thickness
                            ) * 0.9
                          );
                        } else {
                          return min;
                        }
                      },
                      max: ({ max }: { max: number }) => {
                        if (attributes?.initial_thickness && attributes.critical_thickness) {
                          return (
                            Math.max(
                              max,
                              attributes?.initial_thickness,
                              attributes?.critical_thickness
                            ) * 1.1
                          );
                        } else {
                          return max;
                        }
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
                              coord: [
                                dayjs.unix(item.x).local().format('YYYY-MM-DD HH:mm:ss'),
                                item.y
                              ],
                              lineStyle: {
                                color: DURATIONS.find((d) => d.value === item.name)?.color
                              },
                              label: {
                                distance: [-50 * (i - 2), 0]
                              }
                            }));
                          } else {
                            return m;
                          }
                        })
                      }
                    }))
                  }}
                />
              ))}
            </Col>
            <Col span={6} style={{ paddingTop: 60 }}>
              {renderSummary()}
            </Col>
          </Row>
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
      return (
        <Row justify='center' align='bottom'>
          <Col span={4}>
            <span style={{ position: 'relative', top: -5 }}>
              {DURATIONS.find((d) => d.value === duration)!.label}
            </span>
          </Col>
          <Col span={6}>
            <Statistic
              title={i === 0 ? `${intl.get('FIELD_CORROSION_RATE')}(mm/a)` : ' '}
              value={rate}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title={i === 0 ? `${intl.get('FIELD_RESIDUAL_LIFE')}(${intl.get('UNIT_DAY')})` : ' '}
              value={life}
            />
          </Col>
        </Row>
      );
    });
  }

  return (
    <Row gutter={[0, 16]}>
      <Col span={24}>
        <RangeDatePicker
          onChange={React.useCallback((range: [number, number]) => setRange(range), [])}
        />
      </Col>
      <Col span={24}>{renderContent()}</Col>
    </Row>
  );
};
