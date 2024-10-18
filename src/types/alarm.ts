import { ColorDanger, ColorHealth, ColorInfo, ColorWarn } from '../constants/color';

export type AlarmState = 'normal' | 'info' | 'warn' | 'danger' | 'anomalous';

export function getAlarmStateText(state: AlarmState) {
  switch (state) {
    case 'normal':
      return 'ALARM_LEVEL_NORMAL';
    case 'info':
      return 'ALARM_LEVEL_MINOR';
    case 'warn':
      return 'ALARM_LEVEL_MAJOR';
    case 'danger':
      return 'ALARM_LEVEL_CRITICAL';
    case 'anomalous':
      return 'ABNORMAL';
    default:
      return 'UNKNOWN';
  }
}

export function getAlarmLevelColor(state: AlarmState) {
  switch (state) {
    case 'normal':
      return ColorHealth;
    case 'info':
      return ColorInfo;
    case 'warn':
      return ColorWarn;
    case 'danger':
      return ColorDanger;
    default:
      return ColorHealth;
  }
}

export function convertAlarmLevelToState(level: number) {
  switch (level) {
    case 0:
      return 'normal' as AlarmState;
    case 1:
      return 'info' as AlarmState;
    case 2:
      return 'warn' as AlarmState;
    case 3:
      return 'danger' as AlarmState;
    default:
      return 'normal' as AlarmState;
  }
}
