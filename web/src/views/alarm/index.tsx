import { Button, Col, Row, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Content } from 'antd/lib/layout/layout';
import ShadowCard from '../../components/shadowCard';
import MyBreadcrumb from '../../components/myBreadcrumb';
import { Permission } from '../../permission/permission';
import AlarmRule from './rule';
import HasPermission from '../../permission';

const AlarmPage = () => {
  return (
    <Content>
      <MyBreadcrumb>
        <HasPermission value={Permission.AlarmRuleAdd}>
          <Space>
            <Button href='#/alarm-management?locale=alarmRules/addAlarmRule' type='primary'>
              创建规则 <PlusOutlined />
            </Button>
            {/* <Button href='#/alarm-management?locale=alarmRules/addAlarmRules' type='primary'>
              创建规则2 <PlusOutlined />
            </Button> */}
          </Space>
        </HasPermission>
      </MyBreadcrumb>
      <Row justify='center'>
        <Col span={24}>
          <ShadowCard size={'small'}>
            <AlarmRule />
          </ShadowCard>
        </Col>
      </Row>
    </Content>
  );
};

export default AlarmPage;
