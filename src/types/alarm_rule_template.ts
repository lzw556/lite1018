import intl from 'react-intl-universal';

export type AlarmRuleTemplate = {
  id: number;
  name: string;
  measurementType: number;
  rule: AlarmRule;
  level: number;
  description: string;
};

export type AlarmRule = {
  id: number;
  name: string;
  description: string;
  duration: number;
  threshold: number;
  operation: string;
  sourceType: string;
  level: number;
  sources: any[];
  category: number;
};

export function getRuleMethodString(method: string) {
  switch (method) {
    case 'Max':
      return intl.get('MAX');
    case 'Min':
      return intl.get('MIN');
    case 'Mean':
      return intl.get('AVERAGE');
    case 'Current':
      return intl.get('CURRENT');
    case 'X':
      return intl.get('AXIS_X');
    case 'Y':
      return intl.get('AXIS_Y');
    case 'Z':
      return intl.get('AXIS_Z');
  }
  return '';
}
