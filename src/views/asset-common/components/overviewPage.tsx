import * as React from 'react';
import { Col, TableProps } from 'antd';
import { ChartContainer } from '../../../components/charts/chartContainer';
import { ChartOptions } from '../../../components/charts/common';
import { generateColProps } from '../../../utils/grid';
import { Card, Grid } from '../../../components';

export type TableListItem<T> = TableProps<T> & {
  colProps?: {
    xs: { span: number };
    sm: { span: number };
    md: { span: number };
    xl: { span: number };
    xxl: { span: number };
  };
};
type Chart = {
  title?: string;
  colProps: {
    xs: { span: number };
    sm: { span: number };
    md: { span: number };
    xl: { span: number };
    xxl: { span: number };
  };
  options?: ChartOptions<unknown>;
  style?: React.CSSProperties;
  render?: JSX.Element;
  clickHandler?: (paras: any, instance: any) => void;
};
export type Overview = {
  statistics?: JSX.Element;
  charts?: Chart[];
  introductions?: JSX.Element[];
  tabs?: JSX.Element;
  children?: React.ReactNode;
};
export const OverviewPage: React.FC<Overview> = (props) => {
  const { charts, statistics, introductions, tabs } = props;
  const colProps2 = generateColProps({ md: 12, lg: 12, xl: 8, xxl: 6 });

  const renderChart = ({ options, title, style, render, clickHandler }: Chart) => {
    if (render) return render;
    return (
      <ChartContainer
        title={title || ''}
        options={options}
        style={style}
        clickHandler={clickHandler}
      />
    );
  };

  return (
    <div style={{ backgroundColor: '#f5f5f5' }}>
      {statistics}
      <Grid>
        {charts && (
          <Col span={24}>
            <Card>
              <Grid>
                {charts.map((chart, index) => {
                  return (
                    <React.Fragment key={index}>
                      <Col {...chart.colProps}>{renderChart(chart)}</Col>
                    </React.Fragment>
                  );
                })}
              </Grid>
            </Card>
          </Col>
        )}
        {introductions && (
          <Col span={24}>
            <Grid gutter={[12, 12]}>
              {introductions.map((i, index) => (
                <Col {...colProps2} key={index}>
                  {i}
                </Col>
              ))}
            </Grid>
          </Col>
        )}
        {tabs && <Col span={24}>{tabs}</Col>}
        {props.children && <Col span={24}>{props.children}</Col>}
      </Grid>
    </div>
  );
};
