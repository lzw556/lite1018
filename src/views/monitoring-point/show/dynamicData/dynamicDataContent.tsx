import { Col, Empty, Row, Select, Spin } from 'antd';
import * as React from 'react';
import Label from '../../../../components/label';
import ShadowCard from '../../../../components/shadowCard';
import {
  AngleDynamicData,
  DynamicDataType,
  Metadata,
  PreloadDynamicData,
  PreloadWaveData,
  ThicknessWaveData
} from './dynamicDataHelper';
import intl from 'react-intl-universal';
import { NameValueGroups } from '../../../../components/name-values';
import { getValue, roundValue } from '../../../../utils/format';
import { MonitoringPointRow, MonitoringPointTypeValue } from '../../types';
import { CircleChart } from '../../../tower/circleChart';
import { getMonitoringPointType } from '../../utils';
import { isMobile } from '../../../../utils/deviceDetection';
import { PropertyChart, Series } from '../../../../components/charts/propertyChart';
import { AXIS_THREE } from '../../../device/detail/dynamicData/constants';

export const DynamicDataContent = ({
  type,
  data,
  monitoringPoint
}: {
  type: DynamicDataType;
  data: {
    values: PreloadWaveData | ThicknessWaveData | AngleDynamicData | PreloadDynamicData;
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
  const displacements = (
    isAngle
      ? values[
          monitoringPoint.type === MonitoringPointTypeValue.TOWER_BASE_SETTLEMENT
            ? 'dynamic_displacement_axial'
            : 'dynamic_displacement_radial'
        ]
      : []
  ) as number[];
  const isDynamicPreload = 'dynamic_acceleration' in values;
  const angles = isAngle
    ? displacements.map((d, i) => [
        roundValue(d, 2),
        roundValue(values['dynamic_direction'][i] as number, 2)
      ])
    : [];

  const renderMeta = () => {
    return (
      <NameValueGroups
        col={{ span: 12 }}
        divider={50}
        items={type.metaData.map(({ label, value, unit, precision }) => ({
          name: intl.get(label),
          value: getMetaProperty(values.metadata, value, unit, precision)
        }))}
      />
    );
  };

  const renderChart = () => {
    if (loading) return <Spin />;
    if (!values) {
      return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }
    if (isAngle) {
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
          yAxisValueMeta={{ unit: field.unit, precision: field.precision }}
        />
      );
    } else if (isDynamicPreload) {
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
          yAxisValueMeta={{ unit: field.unit, precision: field.precision }}
        />
      );
    } else {
      //Preload Wave, Thickness Wave
      const tofs = values['tof'];
      const tof = values.metadata['tof'];
      const isContained =
        tof && !Number.isNaN(tof) && tof <= Math.max(...tofs) && tof >= Math.min(...tofs);
      const _tofs = Array.from(new Set([...tofs, tof].sort((prev, crt) => prev - crt)));
      const index = _tofs.indexOf(tof);

      let startValue = 0;
      let endValue = 100;
      if (isContained && index !== -1) {
        const percentage = (index / _tofs.length) * 100;
        const interval = { default: 10, medium: 15, large: 20, xLarge: 25 };
        let offsetRight = interval.default;
        let offsetLeft = interval.default;
        if (percentage <= 20) {
          offsetRight = interval.xLarge;
        } else if (percentage <= 30) {
          offsetRight = interval.large;
        } else if (percentage <= 40) {
          offsetRight = interval.medium;
        } else if (percentage >= 60) {
          offsetLeft = interval.medium;
        } else if (percentage >= 80) {
          offsetLeft = interval.large;
        }
        startValue = index - offsetLeft;
        endValue = index + offsetRight;
      }
      return (
        <PropertyChart
          dataZoom={isContained ? { startValue, endValue } : { start: 70, end: 100 }}
          series={[
            {
              data: { [field.label]: values['mv'] },
              xAxisValues: tofs.map((n) => `${n}`),
              raw: { smooth: true }
            }
          ]}
          style={{ height: 450 }}
          xAxisUnit='ns'
          yAxisValueMeta={{ precision: field.precision }}
        />
      );
    }
  };

  return (
    <>
      {isAngle && (
        <Col span={isMobile ? 24 : 8}>
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
            style={{ height: 650 }}
            large={true}
            type={MonitoringPointType}
          />
        </Col>
      )}
      <Col span={isAngle ? (isMobile ? 24 : 10) : 18} style={{ backgroundColor: '#f0f2f5' }}>
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
  meta: Metadata,
  metaValue: string,
  unit: string,
  precision: number
) => {
  if (!meta) return '-';
  if (metaValue === 'defect_location') return '无缺陷';
  return getValue(roundValue(meta[metaValue], precision), unit);
};
