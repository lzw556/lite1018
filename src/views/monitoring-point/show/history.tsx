import { DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import { Button, Col, Empty, Modal, Row, Select, Space, Spin } from 'antd';
import React from 'react';
import { ChartContainer } from '../../../components/charts/chartContainer';
import Label from '../../../components/label';
import { RangeDatePicker } from '../../../components/rangeDatePicker';
import HasPermission from '../../../permission';
import { Permission } from '../../../permission/permission';
import dayjs from '../../../utils/dayjsUtils';
import { isMobile } from '../../../utils/deviceDetection';
import { DownloadHistory } from '../../asset';
import { clearHistory, getDataOfMonitoringPoint } from '../services';
import { MonitoringPointRow } from '../types';
import { getSpecificProperties } from '../utils';
import { generateChartOptionsOfHistoryDatas } from './monitor';
import intl from 'react-intl-universal';

export const MonitoringPointHistory = (point: MonitoringPointRow) => {
  const { id, properties, type } = point;
  const [loading, setLoading] = React.useState(true);
  const [historyOptions, setHistoryOptions] = React.useState<any>();
  const [range, setRange] = React.useState<[number, number]>();
  const [property, setProperty] = React.useState(properties[0].key);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    if (range) fetchData(id, range, property, type);
  }, [id, range, property, type]);

  const fetchData = (id: number, range: [number, number], property: string, type: number) => {
    if (range) {
      const [from, to] = range;
      setLoading(true);
      getDataOfMonitoringPoint(id, from, to).then((data) => {
        setLoading(false);
        if (data.length > 0) {
          setHistoryOptions(generateChartOptionsOfHistoryDatas(data, type, property));
        } else {
          setHistoryOptions(null);
        }
      });
    }
  };

  const renderChart = (options: any) => {
    if (loading) return <Spin />;
    if (!options || options.length === 0) {
      return (
        <Col span={24}>
          <Empty description={intl.get('NO_DATA_PROMPT')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </Col>
      );
    } else {
      return historyOptions.map((ops: any, index: number) => (
        <Col span={24} key={index}>
          <ChartContainer title='' options={ops} style={{ height: '500px' }} />
        </Col>
      ));
    }
  };

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
                  defaultValue={property}
                  placeholder={intl.get('PLEASE_SELECT_SOMETHING', {
                    something: intl.get('PROPERTY')
                  })}
                  style={{ width: isMobile ? '100%' : '120px' }}
                  onChange={(value: string) => {
                    setProperty(value);
                  }}
                >
                  {getSpecificProperties(properties, type).map(({ name, key }) => (
                    <Select.Option key={key} value={key}>
                      {intl.get(name)}
                    </Select.Option>
                  ))}
                </Select>
              </Label>
              <RangeDatePicker
                onChange={React.useCallback((range: [number, number]) => setRange(range), [])}
                showFooter={true}
              />
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
                              if (range) fetchData(id, range, property, type);
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
        </Row>
      </Col>
      {renderChart(historyOptions)}
      {visible && (
        <DownloadHistory
          measurement={point}
          open={visible}
          onSuccess={() => setVisible(false)}
          onCancel={() => setVisible(false)}
        />
      )}
    </Row>
  );
};
