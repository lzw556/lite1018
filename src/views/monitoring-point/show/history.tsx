import { DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import { Button, Card, Col, Empty, Modal, Row, Select, Space, Spin } from 'antd';
import React from 'react';
import Label from '../../../components/label';
import { RangeDatePicker, oneWeekNumberRange } from '../../../components/rangeDatePicker';
import HasPermission from '../../../permission';
import { Permission } from '../../../permission/permission';
import dayjs from '../../../utils/dayjsUtils';
import { isMobile } from '../../../utils/deviceDetection';
import { DownloadHistory } from '../../asset';
import { clearHistory, getDataOfMonitoringPoint } from '../services';
import { HistoryData, MonitoringPointRow, MonitoringPointTypeValue } from '../types';
import { getDisplayProperties, getMonitoringPointType } from '../utils';
import intl from 'react-intl-universal';
import { CircleChart } from '../../tower/circleChart';
import { PropertyChart, transformHistoryData } from '../../../components/charts/propertyChart';
import { DisplayProperty } from '../../../constants/properties';

export const MonitoringPointHistory = (point: MonitoringPointRow) => {
  const { id, name, properties, type, attributes } = point;
  const [loading, setLoading] = React.useState(true);
  const [historyData, setHistoryData] = React.useState<HistoryData>();
  const [range, setRange] = React.useState<[number, number]>(oneWeekNumberRange);
  const displayProperties = getDisplayProperties(properties, type, properties);
  const [property, setProperty] = React.useState<DisplayProperty | undefined>(
    displayProperties ? displayProperties[0] : undefined
  );
  const [open, setVisible] = React.useState(false);
  const isAngle =
    type === MonitoringPointTypeValue.TOWER_INCLINATION ||
    type === MonitoringPointTypeValue.TOWER_BASE_SETTLEMENT;
  const typeLabel = getMonitoringPointType(type);

  const fetchData = (id: number, range: [number, number]) => {
    if (range) {
      const [from, to] = range;
      setLoading(true);
      getDataOfMonitoringPoint(id, from, to).then((data) => {
        setLoading(false);
        if (data.length > 0) {
          setHistoryData(data);
        } else {
          setHistoryData(undefined);
        }
      });
    }
  };

  React.useEffect(() => {
    if (range) fetchData(id, range);
  }, [id, range]);

  const renderChart = () => {
    if (loading) return <Spin />;
    if (!historyData || historyData.length === 0) {
      return (
        <Col span={24}>
          <Empty description={intl.get('NO_DATA_PROMPT')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </Col>
      );
    } else if (property) {
      const { unit, precision } = property;
      const transform = transformHistoryData(historyData, property);
      return (
        <Col span={24}>
          {transform && (
            <Card
              bordered={false}
              title={name}
              headStyle={{ minHeight: '3em', borderColor: 'transparent', textAlign: 'center' }}
              bodyStyle={{ paddingTop: 0 }}
            >
              <PropertyChart
                dataZoom={true}
                series={transform.series}
                style={{ height: 450 }}
                withArea={true}
                yAxisMinInterval={property.interval}
                yAxisValueMeta={{ unit, precision, showName: true }}
              />
            </Card>
          )}
        </Col>
      );
    }
  };

  return (
    <Row gutter={[32, 32]}>
      {isAngle && historyData && (
        <Col span={isMobile ? 24 : 8}>
          <CircleChart
            data={[
              {
                name,
                history: historyData,
                typeLabel: typeLabel ? intl.get(typeLabel) : '',
                height: attributes?.tower_install_height,
                radius: attributes?.tower_base_radius
              }
            ]}
            style={{ height: 550 }}
            large={true}
          />
        </Col>
      )}
      <Col span={isAngle && historyData ? (isMobile ? 24 : 16) : 24}>
        <Row justify='space-between'>
          <Col></Col>
          {displayProperties && displayProperties.length > 0 && property && (
            <Col>
              <Space direction={isMobile ? 'vertical' : 'horizontal'}>
                <Label name={intl.get('PROPERTY')}>
                  <Select
                    bordered={false}
                    defaultValue={property.key}
                    placeholder={intl.get('PLEASE_SELECT_SOMETHING', {
                      something: intl.get('PROPERTY')
                    })}
                    style={{ width: isMobile ? '100%' : '120px' }}
                    onChange={(value: string) => {
                      setProperty(displayProperties.find((item: any) => item.key === value));
                    }}
                  >
                    {displayProperties.map(({ name, key }) => (
                      <Select.Option key={key} value={key}>
                        {intl.get(name)}
                      </Select.Option>
                    ))}
                  </Select>
                </Label>
                <RangeDatePicker onChange={setRange} showFooter={true} />
                <div>
                  <HasPermission value={Permission.MeasurementDataDownload}>
                    <Button
                      type='primary'
                      onClick={() => {
                        setVisible(true);
                      }}
                    >
                      <DownloadOutlined />
                    </Button>
                  </HasPermission>
                  <HasPermission value={Permission.MeasurementDataDelete}>
                    &nbsp;&nbsp;
                    <Button
                      type='default'
                      danger
                      onClick={() => {
                        if (range) {
                          const [from, to] = range;
                          Modal.confirm({
                            title: intl.get('PROMPT'),
                            content: intl.get('DELETE_PROPERTY_DATA_PROMPT', {
                              property: point.name,
                              start: dayjs.unix(from).local().format('YYYY-MM-DD'),
                              end: dayjs.unix(to).local().format('YYYY-MM-DD')
                            }),
                            okText: intl.get('OK'),
                            cancelText: intl.get('CANCEL'),
                            onOk: (close) => {
                              clearHistory(id, from, to).then((_) => {
                                close();
                                if (range) fetchData(id, range);
                              });
                            }
                          });
                        }
                      }}
                    >
                      <DeleteOutlined />
                    </Button>
                  </HasPermission>
                </div>
              </Space>
            </Col>
          )}
        </Row>
        <Row>
          <Col span={24}>{renderChart()}</Col>
        </Row>
      </Col>
      {open && (
        <DownloadHistory
          measurement={point}
          open={open}
          onSuccess={() => setVisible(false)}
          onCancel={() => setVisible(false)}
        />
      )}
    </Row>
  );
};
