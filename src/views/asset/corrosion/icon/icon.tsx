import Icon from '@ant-design/icons';
import React from 'react';
import { ReactComponent as Area } from './general.svg';

export const AreaIcon = ({ className }: { className?: string }) => {
  return <Icon component={() => <Area fill='#fff' className={`icon-svg ${className}`} />} />;
};
