export type WsnSetting = {
  mode: number;
  communication_period: number;
  communication_time_offset: number;
  group_size: number;
};

export const DEFAULT_WSN_SETTING = {
  communication_period: 20 * 60 * 1000,
  communication_period_2: 0,
  communication_offset: 10000,
  group_size: 4,
  group_size_2: 1,
  interval_cnt: 1
};
