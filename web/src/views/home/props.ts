import { ButtonProps, FormItemProps } from 'antd';
import { TableProps } from 'antd/lib/table';
import { ChartOptions } from './charts/common';
import { MeasurementRow } from './measurement/props';

export type AlarmState = 'normal' | 'info' | 'warn' | 'danger' | 'anomalous';
export type AlarmStatistics = Record<AlarmState, NameValue>;

export type Introduction = Pick<Overview, 'statistics'> & {
  parentId: number;
  id: number;
  title: { name: string; path: string };
  icon: { svg: JSX.Element; small: boolean; focus?: boolean };
  alarmState: AlarmState;
  chart?: { title: string; options: ChartOptions<unknown>; style?: React.CSSProperties };
};

export type TableListItem<T> = TableProps<T> & {
  colProps?: {
    xs: { span: number };
    sm: { span: number };
    md: { span: number };
    xl: { span: number };
    xxl: { span: number };
  };
};

export type NameValue = { name: string; value: string | number };

export type Overview = {
  statistics?: NameValue[];
  chartList?: {
    title: string;
    colProps: {
      xs: { span: number };
      sm: { span: number };
      md: { span: number };
      xl: { span: number };
      xxl: { span: number };
    };
    options?: ChartOptions<unknown>;
    style?: React.CSSProperties;
  }[];
  introductionList?: Introduction[];
  tabelList?: TableListItem<any>[];
};

export type SearchResult = {
  actions?: ButtonProps[];
  filters?: FormItemProps<any>[];
  result: TableProps<any>;
};

export type Node = {
  id: number;
  name: string;
  parentId: number;
  children?: Node[];
  type?: number;
  monitoringPoints?: MeasurementRow[];
};
