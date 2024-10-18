import * as React from 'react';
import { Col, Empty, Select } from 'antd';
import intl from 'react-intl-universal';
import { getValue, roundValue } from '../../../../../utils/format';
import { Flex, Grid } from '../../../../../components';
import { NameValueGroups } from '../../../../../components/name-values';
import { PropertyChart, Series } from '../../../../../components/charts/propertyChart';
import Label from '../../../../../components/label';
import { AXIS_THREE } from '../../../../device/detail/dynamicData/constants';
import { Metadata } from '../../../../asset-common';
import { PreloadDynamicData } from './types';

const fields = [
  { label: 'FIELD_PRELOAD', value: 'dynamic_preload', unit: 'kN', precision: 0 },
  { label: 'FIELD_PRESSURE', value: 'dynamic_pressure', unit: 'MPa', precision: 0 },
  { label: 'FIELD_LENGTH', value: 'dynamic_length', unit: 'mm', precision: 1 },
  { label: 'FIELD_TOF', value: 'dynamic_tof', unit: 'ns', precision: 0 },
  { label: 'FIELD_ACCELERATION', value: 'dynamic_acceleration', unit: 'g', precision: 3 }
];
const metaData = [
  { label: 'FIELD_PRELOAD', value: 'min_preload', unit: 'kN', precision: 0 },
  { label: 'FIELD_LENGTH', value: 'min_length', unit: 'mm', precision: 1 },
  { label: 'FIELD_TEMPERATURE', value: 'temperature', unit: '℃', precision: 1 },
  { label: 'FIELD_TOF', value: 'min_tof', unit: 'ns', precision: 0 },
  { label: 'FIELD_DEFECT_LOCATION', value: 'defect_location', unit: 'mm', precision: 3 }
];

export function Preload<T extends PreloadDynamicData>(props: { values: T }) {
  const { values } = props;
  const [field, setField] = React.useState(fields[0]);

  const renderMeta = () => {
    return (
      <NameValueGroups
        col={{ span: 12 }}
        divider={50}
        items={metaData.map(({ label, value, unit, precision }) => ({
          name: intl.get(label),
          value: getMetaProperty(values.metadata, value, unit, precision)
        }))}
      />
    );
  };

  const getMetaProperty = (meta: Metadata, metaValue: string, unit: string, precision: number) => {
    if (!meta) return '-';
    return getValue(roundValue(meta[metaValue], precision), unit);
  };

  const renderChart = () => {
    if (!values) {
      return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }
    const data = values[field.value as keyof Omit<PreloadDynamicData, 'metadata'>];
    let series: Series[] = [];
    if (data.length > 0) {
      if (typeof data[0] === 'number') {
        series = [
          {
            data: { [intl.get(field.label)]: data as number[] },
            xAxisValues: data.map((n, i) => `${i}`)
          }
        ];
      } else {
        type Dynamic_acceleration = Omit<PreloadDynamicData, 'metadata'>['dynamic_acceleration'];
        series = AXIS_THREE.map(({ label, value }) => {
          const axisData = (data as Dynamic_acceleration).map(
            (item) => item[value as keyof Dynamic_acceleration[0]]
          );
          return {
            data: {
              [intl.get(label)]: axisData
            },
            xAxisValues: axisData.map((n, i) => `${i}`)
          };
        });
      }
    }
    return (
      <PropertyChart
        series={series}
        style={{ height: 450 }}
        yAxis={{ unit: field.unit, precision: field.precision }}
      />
    );
  };

  return (
    <Grid>
      <Col span={24}>{renderMeta()}</Col>
      <Col span={24}>
        <Flex>
          <Label name={intl.get('PROPERTY')}>
            <Select
              bordered={false}
              defaultValue={fields[0].value}
              placeholder={intl.get('PLEASE_SELECT_PROPERTY')}
              style={{ width: '120px' }}
              onChange={(value) => {
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
        </Flex>
      </Col>
      <Col span={24}>{renderChart()}</Col>
    </Grid>
  );
}
