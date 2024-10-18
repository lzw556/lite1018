import React from 'react';
import { motor } from './constants';
import { Settings as MotorSettings } from './motor/settings';

export const SettingFormItems = ({ type }: { type: number }) => {
  if (type === motor.type) {
    return <MotorSettings />;
  } else {
    return null;
  }
};
