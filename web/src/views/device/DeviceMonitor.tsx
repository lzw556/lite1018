import { Card, Col, Empty, Row, Typography } from 'antd';
import * as React from 'react';
import moment from 'moment';
import ReactECharts from 'echarts-for-react';
import { GetDeviceDataRequest, GetLastDeviceDataRequest } from '../../apis/device';
import { Property } from '../../types/property';
import { DefaultMonitorDataOption, LineChartStyles } from '../../constants/chart';
import { Device } from '../../types/device';
import { isMobile } from '../../utils/deviceDetection';

export const DeviceMonitor: React.FC<{ device: Device }> = ({ device }) => {
  const [historyOptions, setHistoryOptions] = React.useState<any>();
  const [timestamp, setTimestamp] = React.useState(0);
  const [properties, setProperties] = React.useState<
    (Property & { data: any } & { precision: number })[]
  >([]);
  React.useEffect(() => {
    GetDeviceDataRequest(
      device.id,
      moment().startOf('day').subtract(13, 'd').utc().unix(),
      moment().endOf('day').utc().unix()
    ).then((data) => {
      setHistoryOptions(
        device.properties.map((property: any) => {
          const fields = new Map<string, number[]>();
          const times: any[] = [];
          data
            .map((item: any) => {
              return {
                time: moment.unix(item.timestamp).local(),
                property: item.properties.find((item: any) => item.key === property.key)
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
          Array.from(fields.keys()).forEach((key, index) => {
            series.push({
              ...LineChartStyles[index],
              name: key,
              type: 'line',
              data: fields.get(key)
            });
          });
          return {
            ...DefaultMonitorDataOption,
            tooltip: {
              trigger: 'axis',
              formatter: function (params: any) {
                let relVal = params[0].name;
                for (let i = 0; i < params.length; i++) {
                  let value = Number(params[i].value).toFixed(3);
                  relVal += `<br/> ${params[i].marker} ${params[i].seriesName}: ${value}${property.unit}`;
                }
                return relVal;
              }
            },
            title: { text: property.name },
            series,
            xAxis: {
              type: 'category',
              boundaryGap: false,
              data: times.map((item: any) => item.format('YYYY-MM-DD HH:mm:ss'))
            }
          };
        })
      );
      GetLastDeviceDataRequest(device.id).then(({ timestamp, properties }) => {
        setTimestamp(timestamp);
        setProperties(properties);
      });
    });
  }, [device]);

  const renderDeviceHistoryDataChart = () => {
    if (historyOptions && historyOptions.length) {
      return historyOptions.map((item: any, index: number) => {
        return (
          <Card.Grid key={index} style={{ boxShadow: 'none', border: 'none', width: isMobile ? '100%' : '25%' }}>
            <ReactECharts option={item} style={{ border: 'none', height: '256px' }} />
          </Card.Grid>
        );
      });
    }
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'数据不足'} />;
  };

  React.useEffect(() => {
    if (historyOptions && historyOptions.length && historyOptions.length === properties.length) {
      const _properties = properties;
      setProperties([]);
      setHistoryOptions((prev: any) =>
        prev.map((item: any, index: number) => {
          const property = _properties[index];
          let properName = item.title.text;
          let text = properName;
          let subtext = '';
          const relativedValue = property.data[properName];
          if (relativedValue !== undefined) {
            text += ' ' + relativedValue.toFixed(property.precision) + property.unit;
          } else {
            for (const key in property.data) {
              const value = property.data[key].toFixed(property.precision) + property.unit;
              subtext += `${key}:${value} `;
            }
          }

          return { ...item, title: { text, subtext } };
        })
      );
    }
  }, [historyOptions, properties]);

  return (
    <>
      <Row justify={'start'}>
        <Col span={24}>
          <Typography.Title level={4}>电池电压</Typography.Title>
          <Typography.Text>{device.state.batteryVoltage}mV</Typography.Text>
        </Col>
      </Row>
      <br />
      <Row justify={'start'}>
        <Col span={24}>
          <Typography.Title level={4}>信号强度</Typography.Title>
          <Typography.Text>{device.state.signalLevel}dB</Typography.Text>
        </Col>
      </Row>
      <br />
      {timestamp && (
        <>
          <Row justify={'start'}>
            <Col span={24}>
              <Typography.Title level={4}>最近一次采集时间</Typography.Title>
              <Typography.Text>
                {moment.unix(timestamp).local().format('YYYY-MM-DD HH:mm:ss')}
              </Typography.Text>
            </Col>
          </Row>
          <br />
        </>
      )}
      <Row justify={'start'}>
        <Col span={24}>
          <Typography.Title level={4}>历史数据</Typography.Title>
          <Card bordered={false}>{renderDeviceHistoryDataChart()}</Card>
        </Col>
      </Row>
    </>
  );
};
