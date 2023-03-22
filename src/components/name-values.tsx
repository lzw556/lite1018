import React from 'react';
import './name-values.css';
import intl from 'react-intl-universal';

export const NameValueGroups = ({
  className,
  items,
  horizontal
}: {
  className?: string;
  horizontal?: boolean;
  items: { name: string; value: React.ReactNode; className?: string }[];
}) => {
  let classes = `name-value-groups ${className}`;
  if (horizontal) classes += ` horizontal`;
  return (
    <dl className={classes}>
      {items.map(({ name, value, className }) => (
        <div className={`name-value ${className}`} key={name}>
          <dt>{intl.get(name).d(name)}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
};
