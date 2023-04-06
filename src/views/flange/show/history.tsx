import { DownloadOutlined } from '@ant-design/icons';
import { Button, Col, Empty, Row, Select, Space } from 'antd';
import React from 'react';
import { useHistoryDatas } from '.';
import { checkIsFlangePreload } from '..';
import Label from '../../../components/label';
import { oneWeekNumberRange, RangeDatePicker } from '../../../components/rangeDatePicker';
import HasPermission from '../../../permission';
import { Permission } from '../../../permission/permission';
import { isMobile } from '../../../utils/deviceDetection';
import { AssetRow, DownloadHistory } from '../../asset';
import {
  getRealPoints,
  getSpecificProperties,
  HistoryData,
  MONITORING_POINT
} from '../../monitoring-point';
import { FlangeHistoryChart } from '../historyChart';
import intl from 'react-intl-universal';

export const FlangeHistory = ({
  flange,
  historyDatas
}: {
  flange: AssetRow;
  historyDatas: { name: string; data: HistoryData }[] | undefined;
}) => {
  const realPoints = getRealPoints(flange.monitoringPoints);
  const [range, setRange] = React.useState<[number, number]>();
  const [open, setVisible] = React.useState(false);
  const [property, setProperty] = React.useState<string | undefined>();
  const internalHistorys = useHistoryDatas(flange, range) ?? historyDatas;
  const firstPoint = realPoints[0];

  const handleChange = React.useCallback((range: [number, number]) => {
    if (checkIsRangeChanged(range)) {
      setRange(range);
    }
  }, []);

  function checkIsRangeChanged(range?: [number, number]) {
    if (range === undefined) return false;
    return range[0] !== oneWeekNumberRange[0] || range[1] !== oneWeekNumberRange[1];
  }

  if (realPoints.length === 0)
    return (
      <Empty
        description={intl.get('NO_ASSET_PROMPT', { assetTypeLabel: intl.get(MONITORING_POINT) })}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );

  const properties = getSpecificProperties(firstPoint.properties, firstPoint.type);

  return (
    <Row gutter={[32, 32]}>
      <Col span={24}>
        <Row justify='space-between'>
          <Col></Col>
          <Col>
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
              <RangeDatePicker onChange={handleChange} showFooter={true} />
              {checkIsFlangePreload(flange) && (
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
          </Col>
        </Row>
      </Col>
      <Col span={24}>
        <FlangeHistoryChart
          flange={flange}
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
          assetId={flange.id}
        />
      )}
    </Row>
  );
};
