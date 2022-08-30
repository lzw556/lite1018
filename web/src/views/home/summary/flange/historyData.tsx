import { Col, Empty, Row, Select, Space } from 'antd';
import * as React from 'react';
import ShadowCard from '../../../../components/shadowCard';
import { AssetRow } from '../../assetList/props';
import { getData } from '../measurement/services';
import {
  filterProperties,
  generateChartOptionsOfHistoryData,
  getKeysOfFirstClassFields,
  HistoryData as HistoryDatas,
  sortProperties
} from '../../common/historyDataHelper';
import { isMobile } from '../../../../utils/deviceDetection';
import Label from '../../../../components/label';
import { RangeDatePicker } from '../../../../components/rangeDatePicker';
import { ChartContainer } from '../../components/charts/chartContainer';

export const HistoryData: React.FC<AssetRow> = (props) => {
  const [measurements] = React.useState(props.monitoringPoints || []);
  const properties = measurements[0].properties;
  const [historyOptions, setHistoryOptions] = React.useState<any>();
  const [range, setRange] = React.useState<[number, number]>();
  const [property, setProperty] = React.useState(properties[0].key);
  const [historyDatas, setHistoryDatas] = React.useState<
    { name: string; data: HistoryDatas; index: number }[]
  >([]);

  React.useEffect(() => {
    if (measurements.length > 0 && range) {
      const [from, to] = range;
      measurements.forEach(({ id, name, attributes }) => {
        getData(id, from, to).then((data) => {
          if (data.length > 0)
            setHistoryDatas((prev) => [...prev, { name, data, index: attributes?.index ?? 0 }]);
        });
      });
    }
  }, [measurements, range]);

  React.useEffect(() => {
    if (historyDatas.length > 0 && measurements.length > 0) {
      setHistoryOptions(
        generateChartOptionsOfHistoryData(
          historyDatas.sort((prev, next) => prev.index - next.index),
          measurements[0].properties.find((pro) => pro.key === property) ||
            measurements[0].properties[0],
          measurements[0].type
        )
      );
    }
  }, [historyDatas, measurements, property]);

  const handleChange = React.useCallback((range: [number, number]) => setRange(range), []);

  if (measurements.length === 0)
    return (
      <ShadowCard>
        <Empty description='没有监测点' image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </ShadowCard>
    );
  return (
    <ShadowCard>
      <Row gutter={[32, 32]}>
        <Col span={24}>
          <Row justify='space-between'>
            <Col></Col>
            <Col>
              <Space direction={isMobile ? 'vertical' : 'horizontal'}>
                <Label name={'属性'}>
                  <Select
                    bordered={false}
                    defaultValue={property}
                    placeholder={'请选择属性'}
                    style={{ width: isMobile ? '100%' : '120px' }}
                    onChange={(value: string) => {
                      setProperty(value);
                    }}
                  >
                    {sortProperties(
                      filterProperties(properties),
                      getKeysOfFirstClassFields(measurements[0].type)
                    ).map(({ name, key }) => (
                      <Select.Option key={key} value={key}>
                        {name}
                      </Select.Option>
                    ))}
                  </Select>
                </Label>
                <RangeDatePicker onChange={handleChange} showFooter={true} />
              </Space>
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <ChartContainer title='' options={historyOptions} style={{ height: '500px' }} />
        </Col>
      </Row>
    </ShadowCard>
  );
};
