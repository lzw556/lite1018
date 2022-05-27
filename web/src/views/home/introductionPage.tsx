import * as React from 'react';
import { Link } from 'react-router-dom';
import { ChartContainer } from './charts/chartContainer';
import { Introduction } from './props';

export const IntroductionPage: React.FC<Introduction> = (props) => {
  const {
    title: { name, path },
    statistics,
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
      <dl className='name-value-groups'>
        {statistics &&
          statistics.map(({ name, value }, index) => (
            <div className='name-value' key={index}>
              <dt>{name}</dt>
              <dd>{value}</dd>
            </div>
          ))}
      </dl>
      {chart && chart.options && (
        <ChartContainer options={chart.options} title={chart.title} style={chart.style} />
      )}
      <div className={small ? `introduction-icon small` : `introduction-icon`}>{svg}</div>
    </div>
  );
};
