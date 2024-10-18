import React from 'react';
import { Button, Col, Empty, Select, Space } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import { Flex, Grid } from '../../../../components';
import Label from '../../../../components/label';
import { oneWeekNumberRange, RangeDatePicker } from '../../../../components/rangeDatePicker';
import HasPermission from '../../../../permission';
import { Permission } from '../../../../permission/permission';
import { isMobile } from '../../../../utils/deviceDetection';
import { AssetRow, DownloadData, Point, Points, HistoryData } from '../../../asset-common';
import { useHistoryDatas } from '../../utils';
import { isFlangePreloadCalculation } from '../common';
import { PointsLineChart } from './pointsLineChart';

export const History = ({
  flange,
  historyDatas
}: {
  flange: AssetRow;
  historyDatas: { name: string; data: HistoryData }[] | undefined;
}) => {
  const actuals = Points.filter(flange.monitoringPoints);
  const [range, setRange] = React.useState<[number, number]>(oneWeekNumberRange);
  const [open, setVisible] = React.useState(false);
  const [property, setProperty] = React.useState<string | undefined>();
  const internalHistorys = useHistoryDatas(flange, range) ?? historyDatas;
  const firstPoint = actuals[0];

  if (actuals.length === 0) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;

  const properties = Point.getPropertiesByType(firstPoint.properties, firstPoint.type);

  return (
    <Grid>
      <Col span={24}>
        <Flex>
          <Space direction={isMobile ? 'vertical' : 'horizontal'}>
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
            <RangeDatePicker onChange={setRange} showFooter={true} />
            {isFlangePreloadCalculation(flange) && (
              <HasPermission value={Permission.AssetDataDownload}>
                <Button
                  type='primary'
                  onClick={() => {
                    setVisible(true);
                  }}
                >
                  <DownloadOutlined />
                </Button>
              </HasPermission>
            )}
          </Space>
        </Flex>
      </Col>
      <Col span={24}>
        <PointsLineChart
          flange={flange}
          historyDatas={internalHistorys}
          propertyKey={property}
          showTitle={false}
        />
      </Col>
      {open && actuals.length > 0 && (
        <DownloadData
          measurement={firstPoint}
          open={open}
          onSuccess={() => setVisible(false)}
          onCancel={() => setVisible(false)}
          assetId={flange.id}
        />
      )}
    </Grid>
  );
};
