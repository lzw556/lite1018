import { Col, Row, Select } from 'antd';
import React from 'react';
import { ChartContainer } from '../../../../components/charts/chartContainer';
import Label from '../../../../components/label';
import { isMobile } from '../../../../utils/deviceDetection';
import { getDisplayValue, roundValue } from '../../../../utils/format';
import { MONITORING_POINT, Property } from '../../../monitoring-point';
import intl from 'react-intl-universal';

export type FlangeStatusData = {
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

export function SingleFlangeStatus({
  properties,
  flangeData,
  initialProperty
}: {
  properties: Property[];
  flangeData?: FlangeStatusData;
  initialProperty?: string;
}) {
  const [property, setProperty] = React.useState(initialProperty ?? properties[0].key);

  return (
    <Row>
      {!initialProperty && (
        <Col span={24}>
          <Row justify='end'>
            <Col>
              <Label name={intl.get('PROPERTY')}>
                <Select
                  bordered={false}
                  defaultValue={property}
                  placeholder={intl.get('PLEASE_SELECT_PROPERTY')}
                  style={{ width: isMobile ? '100%' : '120px' }}
                  onChange={(value: string) => {
                    setProperty(value);
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
      )}
      <Col span={24}>
        <ChartContainer
          title=''
          style={{ height: 500 }}
          options={generateFlangeStatusChartOptions(property, flangeData) as any}
        />
      </Col>
    </Row>
  );
}

function generateFlangeStatusChartOptions(propertyKey: string, origialData?: FlangeStatusData) {
  if (!origialData || origialData.values.length === 0) return null;
  const property = origialData.values.find(({ key }) => key === propertyKey);
  const series: any = [];
  const propertyInput = origialData.values.find(({ key }) => key === `${propertyKey}_input`);
  if (propertyInput) {
    const propertyInputDatas = propertyInput.data[propertyInput.name] as {
      index: number;
      value: number;
      timestamp: number;
    }[];
    if (propertyInputDatas.length > 0) {
      series.push({
        type: 'scatter',
        name: intl.get(MONITORING_POINT),
        data: propertyInputDatas.map(({ index, value }) => [index - 1, roundValue(value)])
      });
    }
  }
  let xAxisDatas: number[] = [];
  const fake = origialData.values.find(({ fields }) =>
    fields.find((field) => field.key === propertyKey)
  );
  if (fake) {
    const field = fake.fields.find((field) => field.key === propertyKey);
    if (field) {
      const fakeDatas = fake.data[field.name] as number[];
      if (fakeDatas.length > 0) {
        xAxisDatas = fakeDatas.map((value, index) => index + 1);
        series.push({
          type: 'line',
          name: intl.get('BOLT'),
          data: fakeDatas.map((value, index) => [index, roundValue(value)])
        });
      }
    }
  }

  return {
    tooltip: {
      trigger: 'axis',
      formatter: function (params: any) {
        let relVal = '';
        for (let i = 0; i < params.length; i++) {
          const index = Number(params[i].value[0]) + 1;
          const value = Number(params[i].value[1]);
          relVal += `<br/> ${params[i].marker} ${intl.get('INDEXED_NUMBER', { index })}${
            params[i].seriesName
          }: ${intl.get(property?.name ?? '')}${getDisplayValue(value, property?.unit)}`;
        }
        return relVal;
      }
    },
    legend: { show: !!propertyKey },
    grid: { bottom: 20, left: 50 },
    title: {
      text: `${intl.get(property?.name ?? '')}${property?.unit ? `(${property.unit})` : ''}`
    },
    series,
    xAxis: {
      type: 'category',
      boundaryGap: false,
      axisLabel: { align: 'left' },
      data: xAxisDatas
    },
    yAxis: { type: 'value' }
  };
}
