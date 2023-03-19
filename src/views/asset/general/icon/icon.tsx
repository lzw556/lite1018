import Icon from '@ant-design/icons';
import React from 'react';
import { ReactComponent as General } from './general.svg';

export const GeneralIcon = ({ className }: { className?: string }) => {
  return <Icon component={() => <General fill='#fff' className={`icon-svg ${className}`} />} />;
};
