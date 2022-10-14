import Icon from '@ant-design/icons';
import React from 'react';
import { ReactComponent as Wind } from './wind_turbine.svg';
import { ReactComponent as Default } from './topAssetDefault.svg';

export const WindTurbineIcon = ({ className }: { className?: string }) => {
  if (window.assetCategory === 'wind')
    return <Icon component={() => <Wind fill='#fff' className={`icon-svg ${className}`} />} />;
  return <Icon component={() => <Default fill='#fff' className={`icon-svg ${className}`} />} />;
};
