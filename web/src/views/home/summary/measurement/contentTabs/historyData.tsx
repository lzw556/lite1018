import { DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import { Button, Col, DatePicker, Empty, Modal, Row, Select, Space, Spin } from 'antd';
import moment from 'moment';
import * as React from 'react';
import Label from '../../../../../components/label';
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
  const from = moment().startOf('day').subtract(7, 'd');
  const to = moment().endOf('day');
  const [interval, setInterval] = React.useState<[moment.Moment, moment.Moment]>([from, to]);
  const [property, setProperty] = React.useState(properties[0].key);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const [from, to] = interval;
    setLoading(true);
    getData(id, from.utc().unix(), to.utc().unix()).then((data) => {
      setLoading(false);
      if (data.length > 0) {
        setHistoryOptions(generateChartOptionsOfHistoryDatas(data, property));
      } else {
        setHistoryOptions(null);
      }
    });
  }, [id, interval, property]);

  const renderChart = (options: any) => {
    if (!loading) {
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
    }
  };

  if (loading) return <Spin />;

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
              <DatePicker.RangePicker
                allowClear={false}
                value={interval}
                renderExtraFooter={() => {
                  const calculateInterval = (months: number): [moment.Moment, moment.Moment] => {
                    return [
                      moment().startOf('day').subtract(months, 'months'),
                      moment().endOf('day')
                    ];
                  };
                  return (
                    <Space>
                      <Button type='text' onClick={() => setInterval(calculateInterval(1))}>
                        最近一个月
                      </Button>
                      <Button type='text' onClick={() => setInterval(calculateInterval(3))}>
                        最近三个月
                      </Button>
                      <Button type='text' onClick={() => setInterval(calculateInterval(6))}>
                        最近半年
                      </Button>
                      <Button type='text' onClick={() => setInterval(calculateInterval(12))}>
                        最近一年
                      </Button>
                    </Space>
                  );
                }}
                onChange={(date, dateString) => {
                  if (date) {
                    setInterval([moment(date[0]), moment(date[1])]);
                  }
                }}
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
                    const [from, to] = interval;
                    Modal.confirm({
                      title: '提示',
                      content: `确定要删除${props.name}从${from.format('YYYY-MM-DD')}到${to.format(
                        'YYYY-MM-DD'
                      )}的数据吗？`,
                      okText: '确定',
                      cancelText: '取消',
                      onOk: (close) => {
                        clearHistory(id, from.utc().unix(), to.utc().unix()).then((_) => close());
                      }
                    });
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
