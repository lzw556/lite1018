import { DownloadOutlined } from '@ant-design/icons';
import { Col, Empty, Row, Select, Space, Spin, Table } from 'antd';
import dayjs from '../../../../utils/dayjsUtils';
import * as React from 'react';
import { Device } from '../../../../types/device';
import { isMobile } from '../../../../utils/deviceDetection';
import { EmptyLayout } from '../../../layout';
import { useFindingDeviceData } from '../../hooks/useFindingDeviceData';
import usePermission, { Permission } from '../../../../permission/permission';
import {
  Fields_ad,
  Fields_be,
  Fields_be_axis,
  fields_be_hasAxis,
  useGetingDeviceData,
  Values_ad,
  Values_be
} from '../../hooks/useGetingDeviceData';
import Label from '../../../../components/label';
import { DownloadDeviceDataByTimestampRequest } from '../../../../apis/device';
import { DeviceType } from '../../../../types/device_type';
import { AXIS_THREE, DYNAMIC_DATA_ANGLEDIP, DYNAMIC_DATA_BOLTELONGATION } from './constants';
import ShadowCard from '../../../../components/shadowCard';
import intl from 'react-intl-universal';
import { oneWeekNumberRange, RangeDatePicker } from '../../../../components/rangeDatePicker';
import { useLocaleContext } from '../../../../localeProvider';
import { NameValueGroups } from '../../../../components/name-values';
import { getMetaProperty } from '../../../monitoring-point/show/dynamicData/dynamicDataContent';
import { PropertyChart } from '../../../../components/charts/propertyChart';

export const DynamicData: React.FC<Device> = ({ id, typeId }) => {
  const { language } = useLocaleContext();
  const { fields, data_type } =
    typeId === DeviceType.AngleDip ? DYNAMIC_DATA_ANGLEDIP : DYNAMIC_DATA_BOLTELONGATION;
  const [range, setRange] = React.useState<[number, number]>(oneWeekNumberRange);
  const [isLoading, timestamps] = useFindingDeviceData(id, data_type, range[0], range[1]);
  const [selectedTimestamp, setSelectedTimestamp] = React.useState(0);
  const selectedTimestampObj =
    timestamps.find((t) => t.timestamp === selectedTimestamp) ??
    (timestamps.length > 0 ? timestamps[0] : null);
  const [field, setField] = React.useState(fields[0]);
  const { hasPermission } = usePermission();

  const [isLoading2, data, fetchData] = useGetingDeviceData<Values_be | Values_ad>();

  React.useEffect(() => {
    if (selectedTimestampObj) {
      fetchData(id, selectedTimestampObj.timestamp, { data_type });
    }
  }, [selectedTimestampObj, id, fetchData, data_type]);

  const onDownload = (timestamp: number) => {
    DownloadDeviceDataByTimestampRequest(
      id,
      timestamp,
      {
        data_type
      },
      language === 'en-US' ? 'en' : 'zh'
    ).then((res) => {
      if (res.status === 200) {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
          'download',
          `${dayjs.unix(timestamp).local().format('YYYY-MM-DD_hh-mm-ss')}${intl.get(
            field.label
          )}.csv`
        );
        document.body.appendChild(link);
        link.click();
      }
    });
  };

  return (
    <Row gutter={[0, 16]}>
      <Col span={24}>
        <RangeDatePicker onChange={setRange} />
      </Col>
      <Col span={24}>
        {isLoading && <Spin />}
        {!isLoading && (
          <>
            {timestamps.length === 0 && (
              <Empty
                description={intl.get('NO_DATA_PROMPT')}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
            {timestamps.length > 0 && (
              <Row>
                {renderTimestampList()}
                <Col span={isMobile ? 24 : 18} style={{ backgroundColor: '#f0f2f5' }}>
                  {selectedTimestampObj && (
                    <ShadowCard style={{ marginBottom: 10 }}>{renderMeta()}</ShadowCard>
                  )}
                  <ShadowCard>
                    <Row justify='end'>
                      <Col>
                        <Label name={intl.get('PROPERTY')}>
                          <Select
                            bordered={false}
                            defaultValue={fields[0].value}
                            placeholder={intl.get('PLEASE_SELECT_PROPERTY')}
                            style={{ width: '120px' }}
                            onChange={(value) => {
                              const field = fields.find((f) => f.value === value);
                              if (field) {
                                setField(field);
                              }
                            }}
                          >
                            {fields.map(({ label, value, unit }) => (
                              <Select.Option key={value} value={value} data-unit={unit}>
                                {intl.get(label)}
                              </Select.Option>
                            ))}
                          </Select>
                        </Label>
                      </Col>
                    </Row>
                    <Row justify={'start'}>
                      <Col span={24}>{renderChart()}</Col>
                    </Row>
                  </ShadowCard>
                </Col>
              </Row>
            )}
          </>
        )}
      </Col>
    </Row>
  );

  function renderTimestampList() {
    if (isMobile) {
      return (
        <>
          <Col span={18}>
            <Select
              style={{ width: '100%' }}
              defaultValue={timestamps[0].timestamp}
              onChange={setSelectedTimestamp}
            >
              {timestamps.map((item: any) => (
                <Select.Option key={item.timestamp} value={item.timestamp}>
                  {dayjs.unix(item.timestamp).local().format('YYYY-MM-DD HH:mm:ss')}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col offset={2} span={2}>
            <DownloadOutlined
              onClick={() => {
                if (selectedTimestampObj) {
                  onDownload(selectedTimestampObj?.timestamp);
                }
              }}
            />
          </Col>
        </>
      );
    } else {
      return (
        <>
          <Col span={6}>
            <Table
              size={'middle'}
              scroll={{ y: 500 }}
              showHeader={false}
              columns={[
                {
                  title: intl.get('TIMESTAMP'),
                  dataIndex: 'timestamp',
                  key: 'timestamp',
                  width: '80%',
                  render: (timestamp: number) =>
                    dayjs.unix(timestamp).local().format('YYYY-MM-DD HH:mm:ss')
                },
                {
                  title: intl.get('OPERATION'),
                  key: 'action',
                  render: (text: any, record: any) => {
                    if (hasPermission(Permission.DeviceRawDataDownload)) {
                      return (
                        <Space size='middle'>
                          <a
                            onClick={() => {
                              if (selectedTimestampObj) {
                                onDownload(selectedTimestampObj?.timestamp);
                              }
                            }}
                          >
                            {intl.get('DOWNLOAD')}
                          </a>
                        </Space>
                      );
                    }
                  }
                }
              ]}
              pagination={false}
              dataSource={timestamps}
              rowClassName={(record) =>
                record.timestamp === selectedTimestampObj?.timestamp ? 'ant-table-row-selected' : ''
              }
              onRow={(record) => ({
                onClick: () => {
                  setSelectedTimestamp(record.timestamp);
                },
                onMouseLeave: () => (window.document.body.style.cursor = 'default'),
                onMouseEnter: () => (window.document.body.style.cursor = 'pointer')
              })}
            />
          </Col>
        </>
      );
    }
  }

  function renderMeta() {
    if (!selectedTimestampObj || !data || !data.values || !data.values.metadata) {
      return null;
    } else {
      const meta = data.values.metadata;
      if ('min_preload' in meta) {
        return (
          <NameValueGroups
            col={{ span: 12 }}
            divider={50}
            items={DYNAMIC_DATA_BOLTELONGATION.metaData.map(
              ({ label, value, unit, precision }) => ({
                name: intl.get(label),
                value: getMetaProperty(meta, value, unit, precision)
              })
            )}
          />
        );
      } else {
        return (
          <NameValueGroups
            col={{ span: 12 }}
            divider={50}
            items={DYNAMIC_DATA_ANGLEDIP.metaData.map(({ label, value, unit, precision }) => ({
              name: intl.get(label),
              value: getMetaProperty(meta, value, unit, precision)
            }))}
          />
        );
      }
    }
  }

  function renderChart() {
    if (!selectedTimestampObj || !data || !data.values) {
      return <EmptyLayout description={intl.get('NO_DATA_PROMPT')} />;
    } else {
      let series: any = [];
      const values = data?.values;
      let items: number[] | Fields_be_axis[] = [];
      if (fields_be_hasAxis in values) {
        items = (values as Values_be)[field.value as Fields_be];
      } else {
        items = (values as Values_ad)[field.value as Fields_ad];
      }
      if (!items || items.length === 0)
        return <EmptyLayout description={intl.get('NO_DATA_PROMPT')} />;
      const isAcceleration = Number.isNaN(Number(items[0]));
      if (!isAcceleration) {
        series = [
          {
            data: { [intl.get(field.label)]: items },
            xAxisValues: items.map((n, i) => i)
          }
        ];
      } else {
        series = AXIS_THREE.map((axis) => ({
          data: { [intl.get(axis.label)]: (items as Fields_be_axis[]).map((n) => n[axis.value]) },
          xAxisValues: items.map((n, i) => i)
        }));
      }
      return (
        <PropertyChart
          dataZoom={true}
          loading={isLoading2}
          series={series}
          style={{ height: 330 }}
          yAxisValueMeta={{ precision: field.precision, unit: field.unit }}
        />
      );
    }
  }
};
