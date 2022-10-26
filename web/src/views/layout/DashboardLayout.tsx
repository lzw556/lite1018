import { Layout, Result } from 'antd';
import '../../App.css';
import { FC, useEffect, useState } from 'react';
import { HeaderLayout } from './index';
import { getProject } from '../../utils/session';
import { GetCasbinRequest } from '../../apis/role';
import { store } from '../../store';

const { Content } = Layout;
export interface DashboardLayoutProps {
  children: any;
}

const DashboardLayout: FC<DashboardLayoutProps> = ({ children }) => {
  const [height] = useState<number>(window.innerHeight);

  useEffect(() => {}, []);

  const renderChildren = () => {
    if (getProject()) {
      return children;
    }
    return (
      <Result status='404' title='未找到项目' subTitle='为了更好的体验，请先联系管理员创建项目' />
    );
  };

  return (
    <Layout style={{ height: `${height}px` }}>
      <HeaderLayout hideConsole={false} />
      <Content style={{ position: 'relative', left: 0, right: 0, backgroundColor: '#eef0f5' }}>
        {renderChildren()}
      </Content>
    </Layout>
  );
};

export default DashboardLayout;
