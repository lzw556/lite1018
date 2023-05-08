import Icon from '@ant-design/icons';
import React from 'react';
import { ReactComponent as Tower } from './tower.svg';
import '../../components/icon.css';

export const TowerIcon = ({ className }: { className?: string }) => {
  return (
    <Icon
      component={() => (
        <Tower height={30} width={30} fill='#fff' className={`icon-svg ${className}`} />
      )}
    />
  );
};
