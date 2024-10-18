import { SettingsDetail as MotorSettingsDetail } from './motor/settingsDetail';
import { motor } from './constants';

export const SettingsDetail = ({ type }: { type: number }) => {
  let ele = null;
  switch (type) {
    case motor.type:
      ele = MotorSettingsDetail;
      break;
    default:
      break;
  }
  return <>{ele}</>;
};
