import React from 'react';
import AntIcon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import { convertAlarmLevelToState, getAlarmLevelColor } from '../../types/alarm';
import { AssetRow } from '../asset-common';
import { wind, flange, tower } from './constants';
import { ReactComponent as WindSVG } from './wind_turbine.svg';
import * as Flange from './flange';
import * as Tower from './tower';

export const Icon = (props: Partial<CustomIconComponentProps> & { asset: AssetRow }) => {
  const { asset, ...rest } = props;
  const alarmState = convertAlarmLevelToState(asset.alertLevel);
  const className = `alarm-${alarmState}-fill`;
  const commonProps = { ...rest, className };
  if (asset.type === wind.type) {
    return (
      <AntIcon
        component={() => (
          <WindSVG
            {...{
              ...rest,
              style: {
                borderRadius: '1em',
                backgroundColor: getAlarmLevelColor(alarmState),
                ...rest.style
              }
            }}
            fill='#fff'
          />
        )}
      />
    );
  } else if (asset.type === flange.type) {
    return <Flange.Icon {...commonProps} />;
  } else if (asset.type === tower.type) {
    return <Tower.Icon {...commonProps} />;
  } else {
    return null;
  }
};
