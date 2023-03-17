import Icon from '@ant-design/icons';
import React from 'react';
import { ReactComponent as MonitoringPoint } from './monitoring_point.svg';
import '../../components/icon.css';

export const MonitoringPointIcon = ({ className }: { className?: string }) => {
  return (
    <Icon component={() => <MonitoringPoint fill='#fff' className={`icon-svg ${className}`} />} />
  );
};
