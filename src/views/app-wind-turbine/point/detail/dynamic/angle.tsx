import * as React from 'react';
import { Col, Empty, Select } from 'antd';
import intl from 'react-intl-universal';
import { getValue, roundValue } from '../../../../../utils/format';
import { NameValueGroups } from '../../../../../components/name-values';
import { PropertyChart } from '../../../../../components/charts/propertyChart';
import Label from '../../../../../components/label';
import { generateColProps } from '../../../../../utils/grid';
import { Metadata, MonitoringPointRow, Point } from '../../../../asset-common';
import * as Tower from '../../../tower';
import { AngleDynamicData } from './types';
import { Flex, Grid } from '../../../../../components';

const fields = [
  {
    label: 'FIELD_DISPLACEMENT_RADIAL2',
    value: 'dynamic_displacement_radial',
    unit: 'mm',
    precision: 2
  },
  {
    label: 'FIELD_DISPLACEMENT_EW2',
    value: 'dynamic_displacement_ew',
    unit: 'mm',
    precision: 2
  },
  {
    label: 'FIELD_DISPLACEMENT_NS2',
    value: 'dynamic_displacement_ns',
    unit: 'mm',
    precision: 2
  },
  {
    label: 'FIELD_INCLINATION_RADIAL2',
    value: 'dynamic_inclination_radial',
    unit: '°',
    precision: 2
  },
  { label: 'FIELD_INCLINATION_EW2', value: 'dynamic_inclination_ew', unit: '°', precision: 2 },
  { label: 'FIELD_INCLINATION_NS2', value: 'dynamic_inclination_ns', unit: '°', precision: 2 },
  { label: 'FIELD_DIRECTION', value: 'dynamic_direction', unit: '°', precision: 2 },
  { label: 'FIELD_WAGGLE', value: 'dynamic_waggle', unit: 'g', precision: 2 }
];
const metaData = [
  { label: 'FIELD_INCLINATION', value: 'mean_inclination', unit: '°', precision: 2 },
  { label: 'FIELD_PITCH', value: 'mean_pitch', unit: '°', precision: 2 },
  { label: 'FIELD_ROLL', value: 'mean_roll', unit: '°', precision: 2 },
  { label: 'FIELD_WAGGLE', value: 'mean_waggle', unit: 'g', precision: 2 },
  { label: 'FIELD_TEMPERATURE', value: 'temperature', unit: '℃', precision: 1 }
];

export function Angle<T extends AngleDynamicData>(props: {
  values: T;
  monitoringPoint: MonitoringPointRow;
}) {
  const { values, monitoringPoint } = props;
  const [field, setField] = React.useState(fields[0]);
  const { attributes, name, type } = monitoringPoint;
  const typeLabel = Point.getTypeLabel(type);
  const displacements = values['dynamic_displacement_radial'];
  const angles = displacements.map((d, i) => [
    roundValue(d, 2),
    roundValue(values['dynamic_direction'][i] as number, 2)
  ]);
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
    const data = values[field.value as keyof Omit<AngleDynamicData, 'metadata'>];
    return (
      <PropertyChart
        series={[
          {
            data: { [intl.get(field.label)]: data },
            xAxisValues: data.map((n, i) => `${i}`)
          }
        ]}
        style={{ height: 450 }}
        yAxis={{ unit: field.unit, precision: field.precision }}
      />
    );
  };

  return (
    <Grid>
      <Col {...generateColProps({ md: 24, lg: 24, xl: 10, xxl: 10 })}>
        <Tower.PointsScatterChart
          data={[]}
          dynamicData={[
            {
              name,
              data: angles,
              typeLabel: typeLabel ? intl.get(typeLabel) : '',
              height: attributes?.tower_install_height,
              radius: attributes?.tower_base_radius
            }
          ]}
          style={{ height: 650 }}
          large={true}
          type={type}
        />
      </Col>
      <Col {...generateColProps({ md: 24, lg: 24, xl: 14, xxl: 14 })}>
        <Grid>
          <Col span={24}> {renderMeta()}</Col>
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
          <Col span={24}> {renderChart()}</Col>
        </Grid>
      </Col>
    </Grid>
  );
}
