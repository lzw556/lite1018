import * as React from 'react';
import { Link } from 'react-router-dom';
import { AlarmState } from '../common/statisticsHelper';
import { ChartContainer } from './charts/chartContainer';
import { ChartOptions } from './charts/common';
import { Overview } from './overviewPage';

export type Introduction = Pick<Overview, 'statistics'> & {
  parentId: number;
  id: number;
  title: { name: string; path: string };
  icon: { svg: JSX.Element; small: boolean; focus?: boolean };
  alarmState: AlarmState;
  chart?: {
    title: string;
    options: ChartOptions<unknown>;
    style?: React.CSSProperties;
    clickHandler?: (paras: any, instance: any) => void;
  };
  colProps?: {
    xs: { span: number };
    sm: { span: number };
    md: { span: number };
    xl: { span: number };
    xxl: { span: number };
  };
  statisticsLayout?: string;
};
export const IntroductionPage: React.FC<Introduction> = (props) => {
  const {
    title: { name, path },
    statistics,
    icon: { svg, small, focus },
    alarmState,
    chart,
    statisticsLayout
  } = props;
  return (
    <div className={`introduction ${alarmState} ${focus ? 'focus' : ''}`}>
      <div className='introduction-title'>
        <h3>
          <Link to={path}>{name}</Link>
        </h3>
      </div>
      <dl
        className={statisticsLayout ? `name-value-groups ${statisticsLayout}` : `name-value-groups`}
      >
        {statistics &&
          statistics.map(({ name, value, className }, index) => (
            <div className={`name-value ${className}`} key={index}>
              <dt>{name}</dt>
              <dd>{value}</dd>
            </div>
          ))}
      </dl>
      {chart && (
        <ChartContainer
          options={chart.options}
          title={chart.title}
          style={chart.style}
          clickHandler={chart.clickHandler}
        />
      )}
      <div className={small ? `introduction-icon small` : `introduction-icon`}>{svg}</div>
    </div>
  );
};
