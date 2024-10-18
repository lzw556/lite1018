import React from 'react';
import { Col, Empty, Row, Select } from 'antd';
import intl from 'react-intl-universal';
import Label from '../../../../components/label';
import { isMobile } from '../../../../utils/deviceDetection';
import { roundValue } from '../../../../utils/format';
import { PropertyChart } from '../../../../components/charts/propertyChart';
import { DisplayProperty } from '../../../../constants/properties';
import { MONITORING_POINT } from '../../../asset-common';

export type StatusData = {
  timestamp: number;
  values: {
    key: string;
    name: string;
    precision: number;
    sort: number;
    unit: string;
    fields: { key: string; name: string; dataIndex: number; value: number }[];
    data: {
      [propName: string]: number | { index: number; value: number; timestamp: number }[] | number[];
    };
    isShow: boolean;
  }[];
};

export function SingleStatus({
  properties,
  flangeData
}: {
  properties: DisplayProperty[];
  flangeData?: StatusData;
}) {
  const [property, setProperty] = React.useState(properties.length > 0 ? properties[0] : undefined);

  if (!property) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;

  return (
    <Row>
      <Col span={24}>
        <Row justify='end'>
          <Col>
            <Label name={intl.get('PROPERTY')}>
              <Select
                bordered={false}
                defaultValue={property.key}
                placeholder={intl.get('PLEASE_SELECT_PROPERTY')}
                style={{ width: isMobile ? '100%' : '120px' }}
                onChange={(value: string) => {
                  setProperty(properties.find((item: any) => item.key === value));
                }}
              >
                {properties
                  .filter((pro) => pro.key === 'preload' || pro.key === 'pressure')
                  .map(({ name, key }) => (
                    <Select.Option key={key} value={key}>
                      {intl.get(name)}
                    </Select.Option>
                  ))}
              </Select>
            </Label>
          </Col>
        </Row>
      </Col>
      <Col span={24}>{renderChart(property, flangeData)}</Col>
    </Row>
  );
}

function renderChart(property: DisplayProperty, origialData?: StatusData) {
  if (!origialData || origialData.values.length === 0) return null;
  const series: any = [];
  const propertyInput = origialData.values.find(({ key }) => key === `${property.key}_input`);
  if (propertyInput) {
    const propertyInputDatas = propertyInput.data[propertyInput.name] as {
      index: number;
      value: number;
      timestamp: number;
    }[];
    if (propertyInputDatas.length > 0) {
      series.push({
        data: {
          [intl.get(MONITORING_POINT)]: propertyInputDatas.map(({ value }) => roundValue(value))
        },
        raw: { symbol: 'circle', type: 'scatter' },
        xAxisValues: propertyInputDatas.map(({ index }) => `${index}`)
      });
    }
  }
  const fake = origialData.values.find(({ fields }) =>
    fields.find((field) => field.key === property.key)
  );
  if (fake) {
    const field = fake.fields.find((field) => field.key === property.key);
    if (field) {
      const fakeDatas = fake.data[field.name] as number[];
      if (fakeDatas.length > 0) {
        series.push({
          data: { [intl.get('BOLT')]: fakeDatas.map((value) => roundValue(value)) },
          xAxisValues: fakeDatas.map((n, index) => `${index + 1}`),
          main: true
        });
      }
    }
  }

  if (series.length === 0) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;

  return <PropertyChart series={series} style={{ height: 500 }} yAxis={property} />;
}
