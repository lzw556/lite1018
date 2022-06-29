import Icon from '@ant-design/icons';
import React from 'react';
import { ReactComponent as Wind } from './wind_turbine.svg';

export const WindTurbineIcon = ({ className }: { className?: string }) => {
  return <Icon component={() => <Wind fill='#fff' className={`icon-svg ${className}`} />} />;
};
