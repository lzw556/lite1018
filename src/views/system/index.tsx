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
import intl from 'react-intl-universal';

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
            label={`${intl.get('CPU_CORE')}${index}`}
            labelAlign={'left'}
            labelCol={{ span: 12 }}
            style={{ marginBottom: '2px' }}
            key={item}
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
      <PageTitle items={[{ title: intl.get('MENU_SYSTEM_STATUS') }]} />
      <Row justify={'space-between'}>
        <Col
          span={isMobile ? 24 : 12}
          style={{ paddingRight: isMobile ? 0 : '4px', marginBottom: isMobile ? 8 : 0 }}
        >
          <ShadowCard title={intl.get('SYSTEM_INFO')} size={'small'} style={{ height: '256px' }}>
            <Form.Item
              label={intl.get('OEPRATING_SYSTEM')}
              labelAlign={'left'}
              labelCol={{ span: 12 }}
              style={{ marginBottom: '4px' }}
            >
              {data ? data.server.os.goos : ''}
            </Form.Item>
            <Form.Item
              label={intl.get('STATUS')}
              labelAlign={'left'}
              labelCol={{ span: 12 }}
              style={{ marginBottom: '4px' }}
            >
              <Tag color={ColorHealth}>{intl.get('RUNNING')}</Tag>
            </Form.Item>
            <Form.Item
              label={intl.get('MQTT_ADDRESS')}
              labelAlign={'left'}
              labelCol={{ span: 12 }}
              style={{ marginBottom: '4px' }}
            >
              {data ? data.mqtt.address : ''}
            </Form.Item>
            <Form.Item
              label={intl.get('MQTT_ACCOUNT')}
              labelAlign={'left'}
              labelCol={{ span: 12 }}
              style={{ marginBottom: '4px' }}
            >
              {data ? data.mqtt.username : ''}
            </Form.Item>
            <Form.Item
              label={intl.get('MQTT_PASSWORD')}
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
          <ShadowCard
            title={intl.get('HARD_DISK_STATUS')}
            size={'small'}
            style={{ height: '256px' }}
          >
            <Row justify={'start'}>
              <Col span={6}>
                <Statistic title={intl.get('TOTAL_AMOUNT_MB')} value={data?.server.disk.totalMB} />
                <Statistic title={intl.get('TOTAL_AMOUNT_GB')} value={data?.server.disk.totalGB} />
              </Col>
              <Col span={6}>
                <Statistic title={intl.get('USED_AMOUNT_MB')} value={data?.server.disk.usedMB} />
                <Statistic title={intl.get('USED_AMOUNT_GB')} value={data?.server.disk.usedGB} />
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
          <ShadowCard
            title={intl.get('CPU_RUNNING_STATUS')}
            size={'small'}
            style={{ height: '256px' }}
          >
            <Form.Item
              label={intl.get('NUMBER_OF_CPU_CORES')}
              labelAlign={'left'}
              labelCol={{ span: 12 }}
              style={{ marginBottom: '2px' }}
            >
              {data ? data.server.cpu.cores : ''}
            </Form.Item>
            <Form.Item
              label={intl.get('NUMBER_OF_CPUS')}
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
          <ShadowCard title={intl.get('MEMORY_STATUS')} size={'small'} style={{ height: '256px' }}>
            <Row justify={'start'}>
              <Col span={12}>
                <Statistic title={intl.get('TOTAL_AMOUNT_MB')} value={data?.server.ram.totalMB} />
                <Statistic title={intl.get('USED_AMOUNT_MB')} value={data?.server.ram.usedMB} />
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
