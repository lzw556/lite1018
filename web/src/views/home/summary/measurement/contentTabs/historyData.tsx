import { DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import { Button, Col, Empty, Modal, Row, Select, Space, Spin } from 'antd';
import moment from 'moment';
import * as React from 'react';
import Label from '../../../../../components/label';
import { RangeDatePicker } from '../../../../../components/rangeDatePicker';
import HasPermission from '../../../../../permission';
import { Permission } from '../../../../../permission/permission';
import { generateChartOptionsOfHistoryDatas } from '../../../common/historyDataHelper';
import { ChartContainer } from '../../../components/charts/chartContainer';
import { MeasurementRow } from '../props';
import { clearHistory, getData } from '../services';
import { HistoryDataDownload } from './historyDataDownload';

export const HistoryData: React.FC<MeasurementRow> = (props) => {
  const { id, properties } = props;
  const [loading, setLoading] = React.useState(true);
  const [historyOptions, setHistoryOptions] = React.useState<any>();
  const [range, setRange] = React.useState<[number, number]>();
  const [property, setProperty] = React.useState(properties[0].key);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    if (range) {
      const [from, to] = range;
      setLoading(true);
      getData(id, from, to).then((data) => {
        setLoading(false);
        if (data.length > 0) {
          setHistoryOptions(generateChartOptionsOfHistoryDatas(data, property));
        } else {
          setHistoryOptions(null);
        }
      });
    }
  }, [id, range, property]);

  const renderChart = (options: any) => {
    if (loading) return <Spin />;
    if (!options || options.length === 0) {
      return (
        <Col span={24}>
          <Empty description='暂无数据' image={Empty.PRESENTED_IMAGE_SIMPLE} />
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
            <Space>
              <Label name={'属性'}>
                <Select
                  bordered={false}
                  defaultValue={property}
                  placeholder={'请选择属性'}
                  style={{ width: '120px' }}
                  onChange={(value) => {
                    setProperty(value);
                  }}
                >
                  {properties.map(({ name, key }) => (
                    <Select.Option key={key} value={key}>
                      {name}
                    </Select.Option>
                  ))}
                </Select>
              </Label>
              <RangeDatePicker
                onChange={React.useCallback((range: [number, number]) => setRange(range), [])}
                showFooter={true}
              />
              <HasPermission value={Permission.DeviceDataDownload}>
                <Button
                  type='primary'
                  onClick={() => {
                    setVisible(true);
                  }}
                >
                  <DownloadOutlined />
                </Button>
              </HasPermission>
              <HasPermission value={Permission.DeviceDataDelete}>
                <Button
                  type='default'
                  danger
                  onClick={() => {
                    if (range) {
                      const [from, to] = range;
                      Modal.confirm({
                        title: '提示',
                        content: `确定要删除${props.name}从${moment
                          .unix(from)
                          .local()
                          .format('YYYY-MM-DD')}到${moment
                          .unix(to)
                          .local()
                          .format('YYYY-MM-DD')}的数据吗？`,
                        okText: '确定',
                        cancelText: '取消',
                        onOk: (close) => {
                          clearHistory(id, from, to).then((_) => close());
                        }
                      });
                    }
                  }}
                >
                  <DeleteOutlined />
                </Button>
              </HasPermission>
            </Space>
          </Col>
        </Row>
      </Col>
      {renderChart(historyOptions)}
      {visible && (
        <HistoryDataDownload
          measurement={props}
          visible={visible}
          onSuccess={() => setVisible(false)}
          onCancel={() => setVisible(false)}
        />
      )}
    </Row>
  );
};
