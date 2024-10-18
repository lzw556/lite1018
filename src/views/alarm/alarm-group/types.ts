import { MonitoringPointRow } from '../../asset-common';

export type AlarmRule = {
  id: number;
  name: string;
  description: string;
  category: number;
  type: number;
  rules: {
    id: number;
    name: string;
    description: string;
    index?: any;
    duration: number;
    operation: string;
    threshold: number;
    level: number;
    source_type?: number;
    category: number;
    metric: any;
  }[];
  monitoringPoints?: MonitoringPointRow[];
  bindedStatus?: boolean;
  bindingStatus?: boolean;
  alertLevel?: number;
  editable: boolean;
};
