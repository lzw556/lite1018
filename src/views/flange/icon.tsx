import Icon from '@ant-design/icons';
import React from 'react';
import { ReactComponent as Flange } from './flange.svg';
import '../../components/icon.css';

export const FlangeIcon = ({ className }: { className?: string }) => {
  return (
    <Icon
      component={() => (
        <Flange height={30} width={30} fill='#fff' className={`icon-svg ${className}`} />
      )}
    />
  );
};
