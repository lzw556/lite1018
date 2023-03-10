import { useEffect, useState } from 'react';
import { GetSystemRequest } from '../../apis/system';
import ShadowCard from '../../components/shadowCard';
import { Col, Form, Progress, Row, Statistic, Tag } from 'antd';
import { System } from '../../types/system';
import EChartsReact from 'echarts-for-react';
import { DefaultGaugeOption } from '../../constants/chart';
import { ColorHealth } from '../../constants/color';
import { Content } from 'antd/es/layout/layout';
import { isMobile } from '../../utils/deviceDetection';
import { PageTitle } from '../../components/pageTitle';

const SystemPage = () => {
  const [data, setData] = useState<System>();

  useEffect(() => {
    GetSystemRequest().then(setData);
  }, []);

  const renderUsedChart = (value: number) => {
    if (data) {
      const option = {
        ...DefaultGaugeOption,
        series: [
          {
            ...DefaultGaugeOption.series[0],
            data: [
              {
                value: value
              }
            ]
          }
        ]
      };
      return <EChartsReact option={option} style={{ height: '180px' }} />;
    }
  };

  const renderCores = () => {
    if (data) {
      return data.server.cpu.cpus.map((item, index) => {
        return (
          <Form.Item
            label={`Core${index}`}
            labelAlign={'left'}
            labelCol={{ span: 12 }}
            style={{ marginBottom: '2px' }}
          >
            <Progress
              status={'normal'}
              strokeColor={ColorHealth}
              percent={Number(item.toFixed(0))}
              size={'small'}
              style={{ margin: '2px', width: '164px' }}
            />
          </Form.Item>
        );
      });
    }
    return null;
  };

  return (
    <Content>
      <PageTitle items={[{ title: '系统状态' }]} />
      <Row justify={'space-between'}>
        <Col
          span={isMobile ? 24 : 12}
          style={{ paddingRight: isMobile ? 0 : '4px', marginBottom: isMobile ? 8 : 0 }}
        >
          <ShadowCard title={'系统信息'} size={'small'} style={{ height: '256px' }}>
            <Form.Item
              label={'操作系统'}
              labelAlign={'left'}
              labelCol={{ span: 12 }}
              style={{ marginBottom: '4px' }}
            >
              {data ? data.server.os.goos : ''}
            </Form.Item>
            <Form.Item
              label={'状态'}
              labelAlign={'left'}
              labelCol={{ span: 12 }}
              style={{ marginBottom: '4px' }}
            >
              <Tag color={ColorHealth}>运行中</Tag>
            </Form.Item>
            <Form.Item
              label={'MQTT地址'}
              labelAlign={'left'}
              labelCol={{ span: 12 }}
              style={{ marginBottom: '4px' }}
            >
              {data ? data.mqtt.address : ''}
            </Form.Item>
            <Form.Item
              label={'MQTT账号'}
              labelAlign={'left'}
              labelCol={{ span: 12 }}
              style={{ marginBottom: '4px' }}
            >
              {data ? data.mqtt.username : ''}
            </Form.Item>
            <Form.Item
              label={'MQTT密码'}
              labelAlign={'left'}
              labelCol={{ span: 12 }}
              style={{ marginBottom: '4px' }}
            >
              {data ? data.mqtt.password : ''}
            </Form.Item>
          </ShadowCard>
        </Col>
        <Col
          span={isMobile ? 24 : 12}
          style={{ paddingLeft: isMobile ? 0 : '4px', marginBottom: isMobile ? 8 : 0 }}
        >
          <ShadowCard title={'硬盘状态'} size={'small'} style={{ height: '256px' }}>
            <Row justify={'start'}>
              <Col span={6}>
                <Statistic title={'总量(MB)'} value={data?.server.disk.totalMB} />
                <Statistic title={'总量(GB)'} value={data?.server.disk.totalGB} />
              </Col>
              <Col span={6}>
                <Statistic title={'使用(MB)'} value={data?.server.disk.usedMB} />
                <Statistic title={'使用(GB)'} value={data?.server.disk.usedGB} />
              </Col>
              <Col span={12}>{renderUsedChart(data ? data.server.disk.usedPercent : 0)}</Col>
            </Row>
          </ShadowCard>
        </Col>
      </Row>
      <br />
      <Row justify={'space-between'}>
        <Col
          span={isMobile ? 24 : 12}
          style={{ paddingRight: isMobile ? 0 : '4px', marginBottom: isMobile ? 8 : 0 }}
        >
          <ShadowCard title={'CPU运行状态'} size={'small'} style={{ height: '256px' }}>
            <Form.Item
              label={'CPU核数'}
              labelAlign={'left'}
              labelCol={{ span: 12 }}
              style={{ marginBottom: '2px' }}
            >
              {data ? data.server.cpu.cores : ''}
            </Form.Item>
            <Form.Item
              label={'CPU数量'}
              labelAlign={'left'}
              labelCol={{ span: 12 }}
              style={{ marginBottom: '2px' }}
            >
              {data ? data.server.cpu.cpus.length : ''}
            </Form.Item>
            {renderCores()}
          </ShadowCard>
        </Col>
        <Col
          span={isMobile ? 24 : 12}
          style={{ paddingLeft: isMobile ? 0 : '4px', marginBottom: isMobile ? 8 : 0 }}
        >
          <ShadowCard title={'内存状态'} size={'small'} style={{ height: '256px' }}>
            <Row justify={'start'}>
              <Col span={12}>
                <Statistic title={'总量(MB)'} value={data?.server.ram.totalMB} />
                <Statistic title={'使用(MB)'} value={data?.server.ram.usedMB} />
              </Col>
              <Col span={12}>{renderUsedChart(data ? data.server.ram.usedPercent : 0)}</Col>
            </Row>
          </ShadowCard>
        </Col>
      </Row>
    </Content>
  );
};

export default SystemPage;
