import React from 'react';
import { Badge, Button, Col, Empty, Row, Space, Statistic } from 'antd';
import { ImportOutlined, PlusOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import { useContext, VIRTUAL_ROOT_DEVICE } from '.';
import HasPermission from '../../permission';
import { Permission } from '../../permission/permission';
import { SelfLink } from '../../components/selfLink';
import { Card, Flex } from '../../components';
import { DeviceNS } from './util';
import { generateColProps } from '../../utils/grid';
import dayjs from '../../utils/dayjsUtils';

export const Virtual = () => {
  const { devices } = useContext();

  const renderBody = () => {
    if (devices.length === 0) {
      return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    } else {
      return (
        <Row gutter={[10, 10]}>
          {devices.filter(DeviceNS.Assert.isRoot).map((d) => {
            const { id, name, state } = d;
            const isOnline = state && state.isOnline;
            const connectedAt = state && state.connectedAt;
            const count = DeviceNS.Children.getOnlineStatusCount(d, devices);

            return (
              <Col key={id} {...generateColProps({ md: 12, lg: 12, xl: 8, xxl: 6 })}>
                <SelfLink to={`/devices/${id}`}>
                  <Card size='small' hoverable={true}>
                    <Flex justify='space-between'>
                      {name}
                      <Badge
                        text={isOnline ? intl.get('ONLINE') : intl.get('OFFLINE')}
                        status={isOnline ? 'success' : 'default'}
                        size='small'
                      />
                    </Flex>
                    <div style={{ padding: 20, textAlign: 'center' }}>
                      <Row justify='center'>
                        <Col span={8}>
                          <Statistic
                            value={count.online}
                            valueStyle={{ fontSize: 30 }}
                            title={intl.get('ONLINE')}
                          />
                        </Col>
                        <Col span={8}>
                          <Statistic
                            value={count.offline}
                            valueStyle={{ fontSize: 30 }}
                            title={intl.get('OFFLINE')}
                          />
                        </Col>
                      </Row>
                    </div>
                    <Card.Meta
                      description={
                        <Space>
                          {intl.get('LAST_CONNECTION_TIME')}
                          <span>
                            {connectedAt
                              ? dayjs.unix(state.connectedAt).local().format('YYYY-MM-DD HH:mm:ss')
                              : '-'}
                          </span>
                        </Space>
                      }
                    />
                  </Card>
                </SelfLink>
              </Col>
            );
          })}
        </Row>
      );
    }
  };

  return (
    <Card
      extra={
        <Space>
          <HasPermission value={Permission.NetworkAdd}>
            <SelfLink to='/devices/import'>
              <Button type='primary'>
                {intl.get('MENU_IMPORT_NETWORK')}
                <ImportOutlined />
              </Button>
            </SelfLink>
          </HasPermission>
          <SelfLink to='/devices/create'>
            <Button type='primary'>
              {intl.get('CREATE_SOMETHING', { something: intl.get('DEVICE') })}
              <PlusOutlined />
            </Button>
          </SelfLink>
        </Space>
      }
      title={VIRTUAL_ROOT_DEVICE.name}
    >
      {renderBody()}
    </Card>
  );
};
