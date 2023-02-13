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
      return '最大值';
    case 'Min':
      return '最小值';
    case 'Mean':
      return '平均值';
    case 'Current':
      return '当前值';
    case 'X':
      return 'X轴';
    case 'Y':
      return 'Y轴';
    case 'Z':
      return 'Z轴';
  }
  return '';
}
