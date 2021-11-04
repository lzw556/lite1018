export type WsnSetting = {
    communication_period: number
    communication_time_offset: number
    group_size: number
    group_interval: number
}

export const DEFAULT_WSN_SETTING = {
    communication_period: 20 * 60 * 1000,
    communication_time_offset: 0,
    group_size: 4,
    group_interval: 2 * 60 * 1000
}