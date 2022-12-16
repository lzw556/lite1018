import { Button, Col, Empty, Row, Select, Space } from 'antd';
import * as React from 'react';
import ShadowCard from '../../../../components/shadowCard';
import { AssetRow } from '../../assetList/props';
import { getData } from '../measurement/services';
import {
  generateChartOptionsOfHistoryData,
  getSpecificProperties,
  HistoryData as HistoryDatas
} from '../../common/historyDataHelper';
import { isMobile } from '../../../../utils/deviceDetection';
import Label from '../../../../components/label';
import { RangeDatePicker } from '../../../../components/rangeDatePicker';
import { ChartContainer } from '../../components/charts/chartContainer';
import HasPermission from '../../../../permission';
import { Permission } from '../../../../permission/permission';
import { DownloadOutlined } from '@ant-design/icons';
import { HistoryDataDownload } from '../measurement/contentTabs/historyDataDownload';

export const HistoryData: React.FC<AssetRow> = (props) => {
  const properties =
    props.monitoringPoints && props.monitoringPoints.length > 0
      ? props.monitoringPoints[0].properties
      : [];
  const [historyOptions, setHistoryOptions] = React.useState<any>();
  const [range, setRange] = React.useState<[number, number]>();
  const [property, setProperty] = React.useState(
    properties.length > 0 ? properties[0].key : undefined
  );
  const [historyDatas, setHistoryDatas] = React.useState<
    { name: string; data: HistoryDatas; index: number }[]
  >([]);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const measurements = props.monitoringPoints || [];
    if (measurements.length > 0 && range) {
      const [from, to] = range;
      setHistoryDatas([]);
      measurements.forEach(({ id, name, attributes }) => {
        getData(id, from, to).then((data) => {
          if (data.length > 0)
            setHistoryDatas((prev) => [...prev, { name, data, index: attributes?.index ?? 0 }]);
        });
      });
    }
  }, [props.monitoringPoints, range]);

  React.useEffect(() => {
    const measurements = props.monitoringPoints || [];
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
  }, [historyDatas, props.monitoringPoints, property]);

  const handleChange = React.useCallback((range: [number, number]) => setRange(range), []);

  if (!props.monitoringPoints || props.monitoringPoints.length === 0)
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
                    {getSpecificProperties(properties, props.monitoringPoints[0].type).map(
                      ({ name, key }) => (
                        <Select.Option key={key} value={key}>
                          {name}
                        </Select.Option>
                      )
                    )}
                  </Select>
                </Label>
                <RangeDatePicker onChange={handleChange} showFooter={true} />
                {/* <HasPermission value={Permission.AssetDataDownload}>
                  <Button
                    type='primary'
                    onClick={() => {
                      setVisible(true);
                    }}
                  >
                    <DownloadOutlined />
                  </Button>
                </HasPermission> */}
              </Space>
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <ChartContainer title='' options={historyOptions} style={{ height: '500px' }} />
        </Col>
        {visible && props.monitoringPoints && props.monitoringPoints.length > 0 && (
          <HistoryDataDownload
            measurement={props.monitoringPoints[0]}
            visible={visible}
            onSuccess={() => setVisible(false)}
            onCancel={() => setVisible(false)}
            assetId={props.id}
          />
        )}
      </Row>
    </ShadowCard>
  );
};
