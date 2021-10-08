export type WsnSetting = {
    communication_period: number
    communication_time_offset: number
}

export const DEFAULT_WSN_SETTING = {
    communication_period: 20 * 60 * 1000,
    communication_time_offset: 0,
}