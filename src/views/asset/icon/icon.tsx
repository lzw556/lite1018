import Icon from '@ant-design/icons';
import React from 'react';
import { ReactComponent as Wind } from './wind_turbine.svg';
import '../../../components/icon.css';

export const AssetIcon = ({ className }: { className?: string }) => {
  return <Icon component={() => <Wind fill='#fff' className={`icon-svg ${className}`} />} />;
};
