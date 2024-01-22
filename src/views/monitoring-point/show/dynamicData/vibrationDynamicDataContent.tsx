import { Checkbox, Col, Row, Select, Space } from 'antd';
import * as React from 'react';
import Label from '../../../../components/label';
import ShadowCard from '../../../../components/shadowCard';
import { DynamicDataType, VibrationWaveFormDataType } from './dynamicDataHelper';
import intl from 'react-intl-universal';
import { AXIS_THREE } from '../../../device/detail/dynamicData/constants';
import { PropertyChart } from '../../../../components/charts/propertyChart';

const AXISES = AXIS_THREE.map(({ label, value }) => ({
  label,
  value: value === 'xAxis' ? 0 : value === 'yAxis' ? 1 : 2
})).map(({ value, label }) => ({ value, label: intl.get(label) }));

export const VibrationDynamicDataContent = ({
  type,
  data,
  onFieldChange,
  onAxisChange,
  enableSavingAsImage = false,
  showSideComments = false
}: {
  type: DynamicDataType;
  data: {
    values: VibrationWaveFormDataType;
    loading: boolean;
  };
  enableSavingAsImage?: boolean;
  onFieldChange?: (field: string) => void;
  onAxisChange?: (axis: number) => void;
  showSideComments?: boolean;
}) => {
  const { fields } = type;
  const { loading } = data;
  const [field, setField] = React.useState(fields[0]);
  const [axis, setAxis] = React.useState(0);
  const [isShowEnvelope, setIsShowEnvelope] = React.useState(false);

  return (
    <>
      <Col span={18} style={{ backgroundColor: '#f0f2f5' }}>
        <Row gutter={[0, 12]}>
          <Col span={24}>
            <ShadowCard>
              <Row gutter={[0, 8]}>
                <Col span={24}>
                  <Row justify='end'>
                    <Col>
                      <Space>
                        <Label name={intl.get('PROPERTY')}>
                          <Select
                            bordered={false}
                            defaultValue={fields[0].value}
                            placeholder={intl.get('PLEASE_SELECT_PROPERTY')}
                            style={{ width: '120px' }}
                            onChange={(value) => {
                              onFieldChange?.(value);
                              const field = fields.find((f) => f.value === value);
                              if (field) {
                                setField(field);
                              }
                            }}
                          >
                            {fields.map(({ label, value, unit }) => (
                              <Select.Option key={value} value={value} data-unit={unit}>
                                {intl.get(label).d(label)}
                              </Select.Option>
                            ))}
                          </Select>
                        </Label>
                        <Select
                          defaultValue={0}
                          onChange={(val) => {
                            onAxisChange?.(val);
                            setAxis(val);
                          }}
                        >
                          {AXISES.map(({ value, label }) => (
                            <Select.Option key={value} value={value}>
                              {label}
                            </Select.Option>
                          ))}
                        </Select>
                        {field.value.indexOf('TimeDomain') !== -1 && (
                          <Checkbox
                            defaultChecked={isShowEnvelope}
                            onChange={(e) => {
                              setIsShowEnvelope(e.target.checked);
                            }}
                          >
                            {intl.get('SHOW_ENVELOPE')}
                          </Checkbox>
                        )}
                      </Space>
                    </Col>
                  </Row>
                </Col>
                <Col span={24}>{renderChart()}</Col>
              </Row>
            </ShadowCard>
          </Col>
        </Row>
      </Col>
    </>
  );

  function renderChart() {
    const { frequency, values, xAxis, xAxisUnit, highEnvelopes, lowEnvelopes } = data.values;
    let series: any = [];
    series.push({
      data: { [AXISES.map(({ label }) => label)[axis]]: values },
      xAxisValues: xAxis.map((n) => `${n}`),
      raw: {
        smooth: true
      }
    });
    if (isShowEnvelope) {
      series.push({
        data: { [AXISES.map(({ label }) => label)[axis]]: highEnvelopes },
        xAxisValues: xAxis.map((n) => `${n}`),
        raw: {
          lineStyle: {
            opacity: 0
          },
          areaStyle: {
            color: '#ccc'
          },
          stack: 'confidence-band',
          smooth: true
        }
      });
      series.push({
        data: { [AXISES.map(({ label }) => label)[axis]]: lowEnvelopes },
        xAxisValues: xAxis.map((n) => `${n}`),
        raw: {
          lineStyle: {
            opacity: 0
          },
          areaStyle: {
            color: '#ccc'
          },
          stack: 'confidence-band',
          smooth: true
        }
      });
    }
    return (
      <PropertyChart
        dataZoom={true}
        enableSavingAsImage={enableSavingAsImage}
        loading={loading}
        rawOptions={{ title: { text: `${(frequency ?? 0) / 1000}KHz` } }}
        series={series}
        style={{ height: 500 }}
        xAxisUnit={xAxisUnit}
        yAxisMinInterval={0}
        yAxisValueMeta={{ precision: field.precision, unit: field.unit }}
        showSideComments={showSideComments}
      />
    );
  }
};
