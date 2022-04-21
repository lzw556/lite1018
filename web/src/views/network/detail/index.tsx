import MyBreadcrumb from '../../../components/myBreadcrumb';
import { Content } from 'antd/es/layout/layout';
import ShadowCard from '../../../components/shadowCard';
import { Button, Col, message, Row, Space } from 'antd';
import { useEffect, useState } from 'react';
import { Network } from '../../../types/network';
import { useHistory, useLocation } from 'react-router-dom';
import { GetParamValue } from '../../../utils/path';
import {
  ExportNetworkRequest,
  GetNetworkRequest,
  NetworkProvisionRequest,
  NetworkSyncRequest
} from '../../../apis/network';
import '../../../string-extension';
import moment from 'moment';
import TopologyView from './topologyView';
import { PlusOutlined } from '@ant-design/icons';
import AddDeviceModal from './addDeviceModal';
import '../index.css';
import usePermission, { Permission } from '../../../permission/permission';
import HasPermission from '../../../permission';
import { SingleDeviceDetail } from '../../device/detail/information/SingleDeviceDetail';
import { isMobile } from '../../../utils/deviceDetection';
import ButtonGroup from 'antd/lib/button/button-group';

const NetworkDetail = () => {
  const { hasPermission } = usePermission();
  const location = useLocation();
  const history = useHistory();
  const [network, setNetwork] = useState<Network>();
  const [addDeviceVisible, setAddDeviceVisible] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const onRefresh = () => {
    setRefreshKey(refreshKey + 1);
  };

  useEffect(() => {
    const id = GetParamValue(location.search, 'id');
    if (id) {
      GetNetworkRequest(Number(id))
        .then((data) => {
          setNetwork(data);
        })
        .catch((_) => {
          history.goBack();
        });
    }
  }, []);

  const sendCommand = (network: Network, key: string) => {
    switch (key) {
      case '0':
        NetworkSyncRequest(network.id).then((res) => {
          if (res.code === 200) {
            message.success('发送成功');
          } else {
            message.error(`发送失败: ${res.msg}`);
          }
        });
        break;
      case '1':
        NetworkProvisionRequest(network.id).then((res) => {
          if (res.code === 200) {
            message.success('发送成功');
          } else {
            message.error(`发送失败: ${res.msg}`);
          }
        });
        break;
      case '2':
        exportNetwork(network);
        break;
    }
  };

  const exportNetwork = (n: Network) => {
    ExportNetworkRequest(n.id).then((res) => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${n.name}.json`);
      document.body.appendChild(link);
      link.click();
    });
  };

  const renderInformation = () => {
    if (network) {
      return (
        <Row>
          <Col xl={16} xxl={18}>
            <ShadowCard>
              <TopologyView network={network} />
            </ShadowCard>
          </Col>
          <Col xl={8} xxl={6}>
            <ShadowCard style={{ marginLeft: 10, height: '100%' }}>
              <Row>
                <Col span={8} className='ts-detail-label'>
                  网络名称
                </Col>
                <Col span={16}>
                  <Space>{network.name}</Space>
                </Col>
              </Row>
              <Row>
                <Col span={8} className='ts-detail-label'>
                  通讯周期
                </Col>
                <Col span={16}>
                  <Space>
                    {moment.duration(network.communicationPeriod / 1000, 'seconds').humanize()}
                  </Space>
                </Col>
              </Row>
              <Row>
                <Col span={8} className='ts-detail-label'>
                  每组设备数
                </Col>
                <Col span={16}>{network.groupSize}</Col>
              </Row>
              <Row>
                <Col span={8} className='ts-detail-label'>
                  通讯延时
                </Col>
                <Col span={16}>{`${moment
                  .duration(network.communicationOffset / 1000, 'seconds')
                  .seconds()}秒`}</Col>
              </Row>
              <Row>
                <Col span={8} className='ts-detail-label'>
                  每组通讯间隔
                </Col>
                <Col span={16}>
                  {moment.duration(network.groupInterval / 1000, 'seconds').humanize()}
                </Col>
              </Row>
              <br />
              <Row>
                <Col>
                  <ButtonGroup>
                    {hasPermission(Permission.NetworkSync) && (
                      <Button type='primary' onClick={() => sendCommand(network, '0')}>
                        同步网络
                      </Button>
                    )}
                    {hasPermission(Permission.NetworkProvision) && (
                      <Button type='primary' onClick={() => sendCommand(network, '1')}>
                        继续组网
                      </Button>
                    )}
                    {hasPermission(Permission.NetworkExport) && (
                      <Button type='primary' onClick={() => sendCommand(network, '2')}>
                        导出网络
                      </Button>
                    )}
                  </ButtonGroup>
                </Col>
              </Row>
            </ShadowCard>
          </Col>
        </Row>
      );
    }
  };

  return (
    <Content>
      <MyBreadcrumb firstBreadState={location.state as any}>
        <HasPermission value={Permission.NetworkAddDevices}>
          <Space>
            <Button type={'primary'} onClick={() => setAddDeviceVisible(true)}>
              接入设备 <PlusOutlined />
            </Button>
          </Space>
        </HasPermission>
      </MyBreadcrumb>
      {renderInformation()}
      {network && (
        <AddDeviceModal
          network={network}
          visible={addDeviceVisible}
          onCancel={() => setAddDeviceVisible(false)}
          onSuccess={() => {
            onRefresh();
            setAddDeviceVisible(false);
          }}
        />
      )}
    </Content>
  );
};

export default NetworkDetail;
