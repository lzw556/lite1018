import React from 'react';
import { Button, Col, Empty, Modal, Select, Space, Spin } from 'antd';
import { DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import { DisplayProperty } from '../../../../constants/properties';
import { Card, Flex, Grid } from '../../../../components';
import { oneWeekNumberRange, RangeDatePicker } from '../../../../components/rangeDatePicker';
import { PropertyChart, transformHistoryData } from '../../../../components/charts/propertyChart';
import { isMobile } from '../../../../utils/deviceDetection';
import Label from '../../../../components/label';
import dayjs from '../../../../utils/dayjsUtils';
import HasPermission from '../../../../permission';
import { Permission } from '../../../../permission/permission';
import {
  clearHistory,
  DownloadData,
  getDataOfMonitoringPoint,
  HistoryData,
  MonitoringPointRow,
  Point
} from '../../../asset-common';

export const History = (point: MonitoringPointRow) => {
  const { id, name, properties, type } = point;
  const [loading, setLoading] = React.useState(true);
  const [historyData, setHistoryData] = React.useState<HistoryData>();
  const [range, setRange] = React.useState<[number, number]>(oneWeekNumberRange);
  const displayProperties = Point.getPropertiesByType(properties, type);
  const [property, setProperty] = React.useState<DisplayProperty | undefined>(
    displayProperties ? displayProperties[0] : undefined
  );
  const [open, setVisible] = React.useState(false);

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
      const transform = transformHistoryData(historyData, property);
      return (
        <Col span={24}>
          {transform && (
            <Card
              bordered={false}
              styles={{
                header: { minHeight: '3em', borderColor: 'transparent', textAlign: 'center' }
              }}
              title={name}
            >
              <PropertyChart
                dataZoom={true}
                series={transform.series}
                style={{ height: 650 }}
                withArea={true}
                yAxis={{ ...property, showName: true }}
              />
            </Card>
          )}
        </Col>
      );
    }
  };

  return (
    <Grid>
      <Col span={24}>
        {displayProperties && displayProperties.length > 0 && property && (
          <Col span={24}>
            <Flex>
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
            </Flex>
          </Col>
        )}
      </Col>
      <Col span={24}>{renderChart()}</Col>
      {open && (
        <DownloadData
          measurement={point}
          open={open}
          onSuccess={() => setVisible(false)}
          onCancel={() => setVisible(false)}
        />
      )}
    </Grid>
  );
};
