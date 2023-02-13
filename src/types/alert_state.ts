import { ColorDanger, ColorInfo, ColorWarn } from '../constants/color';

export type AlertState = {
  record: {
    id: number;
  };
  level: number;
  timestamp: number;
};

export function GetAlertColor(state: AlertState | undefined) {
  switch (state?.level) {
    case 1:
      return ColorInfo;
    case 2:
      return ColorWarn;
    case 3:
      return ColorDanger;
  }
}
