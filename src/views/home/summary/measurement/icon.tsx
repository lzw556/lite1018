import Icon from '@ant-design/icons';
import React from 'react';
import { ReactComponent as Measurement } from './measurement.svg';

export const MeasurementIcon = ({ className }: { className?: string }) => {
  return <Icon component={() => <Measurement fill='#fff' className={`icon-svg ${className}`} />} />;
};
