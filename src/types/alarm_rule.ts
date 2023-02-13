import { AlarmRule } from './alarm_rule_template';
import { Measurement } from './measurement';

export type Alarm = {
  id: number;
  name: string;
  measurement: Measurement;
  rule: AlarmRule;
  level: number;
  description: string;
  enabled: boolean;
  createdAt: number;
};
