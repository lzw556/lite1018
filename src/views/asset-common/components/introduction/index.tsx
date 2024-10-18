import * as React from 'react';
import './introduction.css';
import { SelfLink } from '../../../../components/selfLink';
import { AlarmState } from '../../../../types/alarm';

export type IntroductionProps = {
  className?: string;
  count: JSX.Element;
  title: { name: string; path: string; state: any };
  icon: { svg: JSX.Element; small: boolean; focus?: boolean };
  alarmState: AlarmState;
  chart?: JSX.Element;
  horizontal?: boolean;
};
export const Introduction: React.FC<IntroductionProps> = (props) => {
  const {
    className = '',
    title: { name, path, state },
    count,
    icon: { svg, small, focus },
    alarmState,
    chart
  } = props;
  return (
    <div className={`${className} introduction ${alarmState} ${focus ? 'focus' : ''}`}>
      <div className='introduction-title'>
        <h3>
          <SelfLink to={path} state={state}>
            {name}
          </SelfLink>
        </h3>
      </div>
      {count}
      {chart}
      <div className={small ? `introduction-icon small` : `introduction-icon`}>{svg}</div>
    </div>
  );
};
