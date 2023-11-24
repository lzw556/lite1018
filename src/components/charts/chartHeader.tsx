import React from 'react';
import intl from 'react-intl-universal';
import { Statistic } from 'antd';
import { DisplayProperty } from '../../constants/properties';
import { Term } from '../term';
import { useLocaleContext } from '../../localeProvider';
import { getDisplayName, getValue, roundValue } from '../../utils/format';

export const ChartHeader = ({
  property,
  values
}: {
  property: DisplayProperty;
  values: {
    name: string;
    last: number;
    min: number;
    max: number;
  }[];
}) => {
  const { language } = useLocaleContext();
  const isMultiAxis = values.length > 1;
  const { name, unit, precision } = property;
  let title = `${intl.get(name).d(name)}`;
  let valueText = '-';
  if (values.length > 1) {
    title = getDisplayName({ name: title, suffix: unit, lang: language });
    valueText = values.map((v) => `${v.name}${getValue(roundValue(v.last, precision))}`).join(' ');
  } else if (values.length === 1) {
    valueText = getValue(roundValue(values[0].last, precision), unit);
  }

  return (
    <Statistic
      className={isMultiAxis ? 'multi-axis-property-statistic' : ''}
      title={<Term name={title} description={intl.get(`${name}_DESC`)} />}
      value={valueText}
    />
  );
};
