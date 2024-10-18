import React from 'react';
import { Col, Empty, Select, Space } from 'antd';
import intl from 'react-intl-universal';
import { isMobile } from '../../../../utils/deviceDetection';
import Label from '../../../../components/label';
import { Flex, Grid } from '../../../../components';
import { oneWeekNumberRange, RangeDatePicker } from '../../../../components/rangeDatePicker';
import { AssetRow, DownloadData, HistoryData, Point, Points } from '../../../asset-common';
import { useHistoryDatas } from '../../utils';
import { PointsLineChart } from './pointsLineChart';
import { PointsScatterChart } from './pointsScatterChart';

export const History = ({
  asset,
  historyDatas
}: {
  asset: AssetRow;
  historyDatas: { name: string; data: HistoryData; height?: number; radius?: number }[] | undefined;
}) => {
  const realPoints = Points.filter(asset.monitoringPoints);
  const [range, setRange] = React.useState<[number, number]>(oneWeekNumberRange);
  const [open, setVisible] = React.useState(false);
  const [property, setProperty] = React.useState<string | undefined>();
  const internalHistorys = useHistoryDatas(asset, range) ?? historyDatas;
  const firstPoint = realPoints[0];

  if (realPoints.length === 0) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;

  const isEmpty =
    !internalHistorys ||
    internalHistorys.length === 0 ||
    internalHistorys.every(({ data }) => data.length === 0);
  const properties = Point.getPropertiesByType(firstPoint.properties, firstPoint.type);

  return (
    <Grid>
      <Col span={24}>
        <Space direction={isMobile ? 'vertical' : 'horizontal'}>
          <RangeDatePicker onChange={setRange} showFooter={true} />
        </Space>
      </Col>
      {isEmpty && (
        <Col span={24}>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </Col>
      )}
      {!isEmpty && (
        <>
          <Col span={8}>
            <PointsScatterChart
              data={
                internalHistorys?.map((h) => {
                  return {
                    name: h.name,
                    history: h.data,
                    typeLabel: '',
                    height: h.height,
                    radius: h.radius
                  };
                }) ?? []
              }
              style={{ height: 550 }}
              large={true}
              type={firstPoint.type}
              hideSubTitle={true}
            />
          </Col>
          <Col span={16}>
            <Grid>
              <Col span={24}>
                <Flex>
                  <Label name={intl.get('PROPERTY')}>
                    <Select
                      bordered={false}
                      defaultValue={property ?? properties[0].key}
                      placeholder={intl.get('PLEASE_SELECT_PROPERTY')}
                      style={{ width: isMobile ? '100%' : '120px' }}
                      onChange={(value: string) => {
                        setProperty(value);
                      }}
                    >
                      {properties.map(({ name, key }) => (
                        <Select.Option key={key} value={key}>
                          {intl.get(name)}
                        </Select.Option>
                      ))}
                    </Select>
                  </Label>
                </Flex>
              </Col>
              <Col span={24}>
                <PointsLineChart
                  asset={asset}
                  historyDatas={internalHistorys}
                  propertyKey={property}
                  showTitle={false}
                />
              </Col>
              {open && realPoints.length > 0 && (
                <DownloadData
                  measurement={firstPoint}
                  open={open}
                  onSuccess={() => setVisible(false)}
                  onCancel={() => setVisible(false)}
                  assetId={asset.id}
                />
              )}
            </Grid>
          </Col>
        </>
      )}
    </Grid>
  );
};
