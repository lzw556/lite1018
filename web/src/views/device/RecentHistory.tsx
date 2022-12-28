import { Card, Col, Empty, Row, Select, Space } from 'antd';
import * as React from 'react';
import moment from 'moment';
import ReactECharts from 'echarts-for-react';
import { FindDeviceDataRequest } from '../../apis/device';
import { DefaultMonitorDataOption, LineChartStyles } from '../../constants/chart';
import { Device } from '../../types/device';
import { isMobile } from '../../utils/deviceDetection';
import { getSpecificProperties } from './util';
import { DeviceType } from '../../types/device_type';
import Label from '../../components/label';

export const RecentHistory: React.FC<{ device: Device }> = ({ device }) => {
  const isMultiChannels = device.typeId === DeviceType.BoltElongationMultiChannels;
  const [historyOptions, setHistoryOptions] = React.useState<any>();
  const [channel, setChannel] = React.useState('1');

  React.useEffect(() => {
    FindDeviceDataRequest(
      device.id,
      moment().startOf('day').subtract(13, 'd').utc().unix(),
      moment().endOf('day').utc().unix(),
      isMultiChannels ? { channel } : {}
    ).then((data) => {
      setHistoryOptions(
        getSpecificProperties(
          device.properties.filter((pro) => pro.key !== 'channel'),
          device.typeId
        ).map((property: any) => {
          const fields = new Map<string, number[]>();
          const times: any[] = [];
          data
            .map((item: any) => {
              return {
                time: moment.unix(item.timestamp).local(),
                property: item.values.find((item: any) => item.key === property.key)
              };
            })
            .forEach((item: any) => {
              times.push(item.time);
              Object.keys(item.property.data).forEach((key) => {
                if (!fields.has(key)) {
                  fields.set(key, [item.property.data[key]]);
                } else {
                  fields.get(key)?.push(item.property.data[key]);
                }
              });
            });
          const series: any[] = [];
          let subText = '';
          property.fields.forEach((field: any, index: number) => {
            series.push({
              ...LineChartStyles[index],
              name: field.name,
              type: 'line',
              data: fields.get(field.name)
            });
            const datas = fields.get(field.name);
            const value =
              datas && datas.length > 0 ? datas[datas.length - 1] : device.data?.values[field.key];
            if (value) {
              subText += `${field.name} ${value.toFixed(property.precision)} `;
            }
            if (value === 0 || value === '0') {
              subText += `${field.name} ${value} `;
            }
          });
          const title = `${property.name}` + (property.unit ? `(${property.unit})` : '');
          return {
            ...DefaultMonitorDataOption,
            tooltip: {
              trigger: 'axis',
              formatter: function (params: any) {
                let relVal = params[0].name;
                for (let i = 0; i < params.length; i++) {
                  let value: any = Number(params[i].value);
                  value = value ? value.toFixed(3) : value;
                  relVal += `<br/> ${params[i].marker} ${params[i].seriesName}: ${value}${property.unit}`;
                }
                return relVal;
              }
            },
            title: { text: title, subtext: subText },
            series,
            xAxis: {
              type: 'category',
              boundaryGap: false,
              axisLabel: { show: false },
              data: times.map((item: any) => item.format('YYYY-MM-DD HH:mm:ss'))
            }
          };
        })
      );
    });
  }, [device, channel, isMultiChannels]);

  const renderDeviceHistoryDataChart = () => {
    if (historyOptions && historyOptions.length) {
      return historyOptions.map((item: any, index: number) => {
        return (
          <Card.Grid
            key={index}
            style={{ boxShadow: 'none', border: 'none', width: isMobile ? '100%' : '25%' }}
          >
            <ReactECharts option={item} style={{ border: 'none', height: '256px' }} />
          </Card.Grid>
        );
      });
    }
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'数据不足'} />;
  };

  // React.useEffect(() => {
  //     if (historyOptions && historyOptions.length) {
  //         setHistoryOptions((prev: any) =>
  //             prev.map((item: any, index: number) => {
  //                 const property = device.properties[index];
  //                 let text = '';
  //                 let subtext = '';
  //                 property.fields.forEach((field:any) => {
  //                     text += ' ' + device.data[field.key].toFixed(property.precision) + property.unit;
  //                 })
  //                 return {...item, title: {text, subtext}};
  //             })
  //         );
  //     }
  // }, [historyOptions]);

  return (
    <Row justify={'start'}>
      <Col span={24}>
        <Card
          bordered={false}
          title={
            isMultiChannels && (
              <Space>
                <Label name='当前通道号'>
                  <Select
                    onChange={(val) => setChannel(val)}
                    defaultValue={channel}
                    bordered={false}
                  >
                    {[
                      { label: '1', key: 1 },
                      { label: '2', key: 2 },
                      { label: '3', key: 3 },
                      { label: '4', key: 4 }
                    ].map(({ label, key }) => (
                      <Select.Option value={key} key={key}>
                        {label}
                      </Select.Option>
                    ))}
                  </Select>
                </Label>
              </Space>
            )
          }
        >
          {renderDeviceHistoryDataChart()}
        </Card>
      </Col>
    </Row>
  );
};
