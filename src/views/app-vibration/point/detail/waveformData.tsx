import React from 'react';
import { Checkbox, Col, Select, Space } from 'antd';
import intl from 'react-intl-universal';
import { Flex, Grid } from '../../../../components';
import { PropertyChart } from '../../../../components/charts/propertyChart';
import Label from '../../../../components/label';
import { AXIS_THREE } from '../../../device/detail/dynamicData/constants';
import { DynamicData } from '../../../asset-common';

type Field = { label: string; value: string; unit: string; precision: number };

const fields: Field[] = [
  {
    label: 'FIELD_ORIGINAL_DOMAIN',
    value: 'originalDomain',
    unit: '',
    precision: 1
  },
  {
    label: 'FIELD_ACCELERATION_TIME_DOMAIN',
    value: 'accelerationTimeDomain',
    unit: 'm/s²',
    precision: 1
  },
  {
    label: 'FIELD_ACCELERATION_FREQUENCY_DOMAIN',
    value: 'accelerationFrequencyDomain',
    unit: 'm/s²',
    precision: 3
  },
  {
    label: 'FIELD_VELOCITY_TIME_DOMAIN',
    value: 'velocityTimeDomain',
    unit: '',
    precision: 1
  },
  {
    label: 'FIELD_VELOCITY_FREQUENCY_DOMAIN',
    value: 'velocityFrequencyDomain',
    unit: '',
    precision: 3
  },
  {
    label: 'FIELD_DISPLACEMENT_TIME_DOMAIN',
    value: 'displacementTimeDomain',
    unit: '',
    precision: 1
  },
  {
    label: 'FIELD_DISPLACEMENT_FREQUENCY_DOMAIN',
    value: 'displacementFrequencyDomain',
    unit: '',
    precision: 3
  }
];

type Data = {
  frequency: number;
  highEnvelopes: number[];
  lowEnvelopes: number[];
  values: number[];
  xAxis: number[];
  xAxisUnit: string;
  yAxisUnit: string;
};

const AXISES = AXIS_THREE.map(({ label, value }) => ({
  label,
  value: value === 'xAxis' ? 0 : value === 'yAxis' ? 1 : 2
})).map(({ value, label }) => ({ value, label: intl.get(label) }));

export function WaveformData(props: { id: number }) {
  const { id } = props;
  const [field, setField] = React.useState(fields[0]);
  const [axis, setAxis] = React.useState(0);

  return (
    <DynamicData<Data>
      children={(values) => (
        <Content {...{ values, axis, field, onAxisChange: setAxis, onFieldChange: setField }} />
      )}
      dataType='raw'
      filters={{ axis, field: field.value }}
      id={id}
    />
  );
}

const Content = <T extends Data>(props: {
  axis: number;
  field: Field;
  onAxisChange: (axis: number) => void;
  onFieldChange: (field: Field) => void;
  values: T;
}) => {
  const { axis, field } = props;
  const [isShowEnvelope, setIsShowEnvelope] = React.useState(false);

  function renderChart() {
    const { frequency, values, xAxis, xAxisUnit, yAxisUnit, highEnvelopes, lowEnvelopes } =
      props.values;
    let series: any = [];
    if (!!values && !!xAxis) {
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
    }
    return (
      <PropertyChart
        dataZoom={true}
        rawOptions={{ title: { text: `${(frequency ?? 0) / 1000}KHz` } }}
        series={series}
        style={{ height: 500 }}
        xAxis={{ unit: xAxisUnit }}
        yAxis={{
          interval: 0,
          precision: field.precision,
          unit: field.unit.length > 0 ? field.unit : yAxisUnit,
          showName: true
        }}
      />
    );
  }

  return (
    <Grid>
      <Col span={24}>
        <Flex>
          <Space>
            <Label name={intl.get('PROPERTY')}>
              <Select
                variant='borderless'
                defaultValue={fields[0].value}
                placeholder={intl.get('PLEASE_SELECT_PROPERTY')}
                style={{ width: '120px' }}
                onChange={(value) => {
                  const field = fields.find((f) => f.value === value);
                  if (field) {
                    props.onFieldChange(field);
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
                props.onAxisChange(val);
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
        </Flex>
      </Col>
      <Col span={24}>{renderChart()}</Col>
    </Grid>
  );
};
