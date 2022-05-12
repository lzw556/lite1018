import { ButtonProps, FormItemProps } from 'antd';
import { TableProps } from 'antd/lib/table';
import { ChartOptions } from './charts/common';

export type Entity = {
  id: number;
  name: string;
};

export type Introduction = {
  parentId: number;
  id: number;
  title: { name: string; path: string };
  properties: {
    name: string;
    value: string | number;
  }[];
  icon: { svg: JSX.Element; small: boolean; focus?: boolean };
  alarmState: 'normal' | 'info' | 'warn' | 'danger';
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

export type Overview = {
  properties?: {
    name: string;
    value: string | number;
  }[];
  chartList: {
    title: string;
    colProps: {
      xs: { span: number };
      sm: { span: number };
      md: { span: number };
      xl: { span: number };
      xxl: { span: number };
    };
    options: ChartOptions<unknown>;
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
