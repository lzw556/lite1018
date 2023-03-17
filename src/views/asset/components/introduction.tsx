import * as React from 'react';
import { Link } from 'react-router-dom';
import { AlarmState } from '..';
import './introduction.css';

export type IntroductionProps = {
  count: JSX.Element;
  title: { name: string; path: string; state: any };
  icon: { svg: JSX.Element; small: boolean; focus?: boolean };
  alarmState: AlarmState;
  chart?: JSX.Element;
  horizontal?: boolean;
};
export const Introduction: React.FC<IntroductionProps> = (props) => {
  const {
    title: { name, path, state },
    count,
    icon: { svg, small, focus },
    alarmState,
    chart
  } = props;
  return (
    <div className={`introduction ${alarmState} ${focus ? 'focus' : ''}`}>
      <div className='introduction-title'>
        <h3>
          <Link to={path} state={state}>
            {name}
          </Link>
        </h3>
      </div>
      {count}
      {chart}
      <div className={small ? `introduction-icon small` : `introduction-icon`}>{svg}</div>
    </div>
  );
};
