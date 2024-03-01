import { Col, Empty, Row, Select, Space } from 'antd';
import React from 'react';
import { useHistoryDatas } from '.';
import Label from '../../../components/label';
import { oneWeekNumberRange, RangeDatePicker } from '../../../components/rangeDatePicker';
import { isMobile } from '../../../utils/deviceDetection';
import { AssetRow, DownloadHistory } from '../../asset';
import {
  getDisplayProperties,
  getRealPoints,
  HistoryData,
  MONITORING_POINT
} from '../../monitoring-point';
import { TowerHistoryChart } from '../historyChart';
import intl from 'react-intl-universal';
import { CircleChart } from '../circleChart';

export const TowerHistory = ({
  tower,
  historyDatas
}: {
  tower: AssetRow;
  historyDatas: { name: string; data: HistoryData; height?: number; radius?: number }[] | undefined;
}) => {
  const realPoints = getRealPoints(tower.monitoringPoints);
  const [range, setRange] = React.useState<[number, number]>(oneWeekNumberRange);
  const [open, setVisible] = React.useState(false);
  const [property, setProperty] = React.useState<string | undefined>();
  const internalHistorys = useHistoryDatas(tower, range) ?? historyDatas;
  const firstPoint = realPoints[0];

  if (realPoints.length === 0)
    return (
      <Empty
        description={intl.get('NO_ASSET_PROMPT', { assetTypeLabel: intl.get(MONITORING_POINT) })}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );

  const isEmpty =
    !internalHistorys ||
    internalHistorys.length === 0 ||
    internalHistorys.every(({ data }) => data.length === 0);
  const properties = getDisplayProperties(firstPoint.properties, firstPoint.type);

  return (
    <Row gutter={[32, 32]}>
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
            <CircleChart
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
            <Row justify='end'>
              <Col>
                {' '}
                <Col span={24}>
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
                </Col>
              </Col>
            </Row>
            <Row gutter={[32, 32]}>
              <Col span={24}>
                <TowerHistoryChart
                  tower={tower}
                  historyDatas={internalHistorys}
                  propertyKey={property}
                  showTitle={false}
                />
              </Col>
              {open && realPoints.length > 0 && (
                <DownloadHistory
                  measurement={firstPoint}
                  open={open}
                  onSuccess={() => setVisible(false)}
                  onCancel={() => setVisible(false)}
                  assetId={tower.id}
                />
              )}
            </Row>
          </Col>
        </>
      )}
    </Row>
  );
};
