import * as React from 'react';
import { Link } from 'react-router-dom';
import { ChartContainer } from './charts/chartContainer';
import { Introduction } from './props';

export const IntroductionPage: React.FC<Introduction> = (props) => {
  const {
    title: { name, path },
    properties,
    icon: { svg, small, focus },
    alarmState,
    chart
  } = props;
  return (
    <div className={`introduction ${alarmState} ${focus ? 'focus' : ''}`}>
      <div className='introduction-title'>
        <h3>
          <Link to={path}>{name}</Link>
        </h3>
      </div>
      <dl className='introduction-content'>
        {properties.map(({ name, value }) => (
          <div className='name-value' key={value}>
            <dt>{name}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {chart && <ChartContainer options={chart.options} title={chart.title} style={chart.style} />}
      <div className={small ? `introduction-icon small` : `introduction-icon`}>{svg}</div>
    </div>
  );
};
