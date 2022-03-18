import { Card, Col, Empty, Row, Typography } from 'antd';
import * as React from 'react';
import moment from 'moment';
import ReactECharts from 'echarts-for-react';
import { FindDeviceDataRequest } from '../../apis/device';
import { DefaultMonitorDataOption, LineChartStyles } from '../../constants/chart';
import { Device } from '../../types/device';

export const RecentHistory: React.FC<{ device: Device }> = ({ device }) => {
  const [historyOptions, setHistoryOptions] = React.useState<any>();

  React.useEffect(() => {
    FindDeviceDataRequest(
      device.id,
      moment().startOf('day').subtract(13, 'd').utc().unix(),
      moment().endOf('day').utc().unix(),
      {}
    ).then((data) => {
      setHistoryOptions(
        device.properties.map((property: any) => {
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
            const value = device.data?.values[field.key];
            if (value) {
              subText += `${field.name} ${value.toFixed(property.precision)} `;
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
                  let value = Number(params[i].value).toFixed(3);
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
              data: times.map((item: any) => item.format('YYYY-MM-DD HH:mm:ss'))
            }
          };
        })
      );
    });
  }, [device]);

  const renderDeviceHistoryDataChart = () => {
    if (historyOptions && historyOptions.length) {
      return historyOptions.map((item: any, index: number) => {
        return (
          <Card.Grid key={index} style={{ boxShadow: 'none', border: 'none', width: '25%' }}>
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
        <Card bordered={false}>{renderDeviceHistoryDataChart()}</Card>
      </Col>
    </Row>
  );
};
