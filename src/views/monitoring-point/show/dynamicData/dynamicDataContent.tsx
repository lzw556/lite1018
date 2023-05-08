import { Col, Row, Select, Spin } from 'antd';
import * as React from 'react';
import { ChartContainer } from '../../../../components/charts/chartContainer';
import Label from '../../../../components/label';
import ShadowCard from '../../../../components/shadowCard';
import {
  DynamicDataProperty,
  DynamicDataType,
  generateChartOptions,
  transformDynamicData
} from './dynamicDataHelper';
import intl from 'react-intl-universal';
import { NameValueGroups } from '../../../../components/name-values';
import { roundValue } from '../../../../utils/format';
import { MonitoringPointRow } from '../../types';
import { CircleChart } from '../../../tower/circleChart';
import { getMonitoringPointType } from '../../utils';

export const DynamicDataContent = ({
  type,
  data,
  monitoringPoint
}: {
  type: DynamicDataType;
  data: {
    values: DynamicDataProperty;
    loading: boolean;
  };
  monitoringPoint: MonitoringPointRow;
}) => {
  const { fields } = type;
  const { name, type: MonitoringPointType, attributes } = monitoringPoint;
  const typeLabel = getMonitoringPointType(MonitoringPointType);
  const { values, loading } = data;
  const [field, setField] = React.useState(fields[0]);
  const isAngle = 'dynamic_direction' in values && 'dynamic_displacement' in values;
  const displacements = values['dynamic_displacement_radial'] as number[];
  const angles = displacements.map((d, i) => [
    roundValue(d),
    roundValue(values['dynamic_direction'][i] as number)
  ]);

  const renderMeta = () => {
    return (
      <NameValueGroups
        col={{ span: 12 }}
        divider={50}
        items={type.metaData.map(({ label, value, unit }) => ({
          name: intl.get(label),
          value: getMetaProperty(values.metadata, value, unit)
        }))}
      />
    );
  };

  const renderChart = () => {
    if (loading) return <Spin />;
    const _field = {
      ...field,
      label: intl.get(field.label)
    };
    return (
      <ChartContainer
        options={generateChartOptions(transformDynamicData(values, _field), _field) as any}
        title=''
      />
    );
  };

  return (
    <>
      {isAngle && (
        <Col span={8}>
          <CircleChart
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
            style={{ height: 550 }}
            large={true}
          />
        </Col>
      )}
      <Col span={isAngle ? 10 : 18} style={{ backgroundColor: '#f0f2f5' }}>
        <Row gutter={[0, 12]}>
          <Col span={24}>
            <ShadowCard>{renderMeta()}</ShadowCard>
          </Col>
          <Col span={24}>
            <ShadowCard>
              <Row gutter={[0, 8]}>
                <Col span={24}>
                  <Row justify='end'>
                    <Col>
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
};

export const getMetaProperty = (
  meta: DynamicDataProperty['metadata'],
  metaValue: string,
  unit: string
) => {
  if (!meta) return '-';
  if (metaValue === 'defect_location') return '无缺陷';
  if (meta[metaValue] === undefined || meta[metaValue] === null) return '-';
  let value = meta[metaValue] ? meta[metaValue].toFixed(3) : meta[metaValue];
  return `${value}${unit}`;
};
