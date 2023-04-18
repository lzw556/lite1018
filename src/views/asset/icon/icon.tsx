import Icon from '@ant-design/icons';
import React from 'react';
import { ReactComponent as Wind } from './wind_turbine.svg';
import { ReactComponent as Corrosion } from './corrosion.svg';
import '../../../components/icon.css';
import { useAppConfigContext } from '../components';

export const AssetIcon = ({ className }: { className?: string }) => {
  const config = useAppConfigContext();
  if (config === 'corrosion' || config === 'corrosionWirelessHART') {
    return (
      <Icon component={() => <Corrosion fill='#fff' className={`icon-svg ${className} focus`} />} />
    );
  }
  return <Icon component={() => <Wind fill='#fff' className={`icon-svg ${className}`} />} />;
};
