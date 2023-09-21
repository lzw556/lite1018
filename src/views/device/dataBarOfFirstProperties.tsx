import React from 'react';
import intl from 'react-intl-universal';
import { getDisplayName } from '../../utils/format';
import { useLocaleContext } from '../../localeProvider';

export const DataBarOfFirstProperties = ({
  channel,
  data
}: {
  channel?: number;
  data: {
    name: string;
    key: string;
    value: string;
    fieldName: string | undefined;
  }[];
}) => {
  const { language } = useLocaleContext();
  const separator = language === 'en-US' ? ':' : '：';
  const channelText = channel ? `${intl.get('CHANNEL')}${channel}${separator}` : undefined;

  return (
    <span>
      {channelText && <span style={{ paddingRight: 8 }}>{channelText}</span>}
      {data.map(({ name, value, fieldName }, i) => {
        const suffix = fieldName && intl.get(fieldName);
        const displayName = getDisplayName({ name: intl.get(name), lang: language, suffix });
        return (
          <>
            <span style={{ paddingLeft: i === 0 ? 'auto' : 8 }}>{displayName}</span>
            {separator}
            {value}
          </>
        );
      })}
    </span>
  );
};
