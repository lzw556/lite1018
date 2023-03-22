import { Col, Row, Select } from 'antd';
import * as React from 'react';
import Label from '../../../../components/label';
import { isMobile } from '../../../../utils/deviceDetection';
import { generateFlangeStatusChartOptions } from '../../common/historyDataHelper';
import { ChartContainer } from '../../components/charts/chartContainer';
import { Property } from '../measurement/props';
import { FlangeStatusData } from './FlangeStatus';
import intl from 'react-intl-universal';

export const SingleFlangeStatus: React.FC<{
  properties: Property[];
  flangeData?: FlangeStatusData;
  initialProperty?: string;
}> = ({ properties, flangeData, initialProperty }) => {
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
};
