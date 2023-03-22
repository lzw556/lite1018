import intl from 'react-intl-universal';

export const SETTING_GROUPS = {
  preload: intl.get('SETTING_GROUP_PRELOAD'),
  general: intl.get('SETTING_GROUP_GENERAL'),
  network: intl.get('SETTING_GROUP_NETWORK'),
  channel1: intl.get('SETTING_GROUP_CHANNEL', { channel: 1 }),
  channel2: intl.get('SETTING_GROUP_CHANNEL', { channel: 2 }),
  channel3: intl.get('SETTING_GROUP_CHANNEL', { channel: 3 }),
  channel4: intl.get('SETTING_GROUP_CHANNEL', { channel: 4 })
};
