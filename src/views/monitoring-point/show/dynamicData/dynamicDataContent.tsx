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

export const DynamicDataContent = ({
  type,
  data
}: {
  type: DynamicDataType;
  data: {
    values: DynamicDataProperty;
    loading: boolean;
  };
}) => {
  const { fields } = type;
  const { values, loading } = data;
  const [field, setField] = React.useState(fields[0]);

  const renderMeta = () => {
    return (
      <NameValueGroups
        items={type.metaData.map(({ label, value, unit }) => ({
          name: label,
          value: getMetaProperty(values.metadata, value, unit)
        }))}
      />
    );
  };

  const renderChart = () => {
    if (loading) return <Spin />;
    return (
      <ChartContainer
        options={generateChartOptions(transformDynamicData(values, field), field) as any}
        title=''
      />
    );
  };

  return (
    <Col span={18} style={{ backgroundColor: '#f0f2f5' }}>
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
                        onChange={(value, option: any) =>
                          setField({
                            label: option.children,
                            value: option.key,
                            unit: option.props['data-unit']
                          } as any)
                        }
                      >
                        {fields.map(({ label, value, unit }) => (
                          <Select.Option key={value} value={value} data-unit={unit}>
                            {intl.get(label)}
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
