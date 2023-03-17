import { Col, Row, TableProps } from 'antd';
import * as React from 'react';
import { ChartContainer } from '../../../components/charts/chartContainer';
import { ChartOptions } from '../../../components/charts/common';
import ShadowCard from '../../../components/shadowCard';
import { generateColProps } from '../../../utils/grid';

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
    <>
      {statistics}
      <Row gutter={[0, 16]}>
        {charts && (
          <Col span={24}>
            <ShadowCard>
              <Row>
                {charts.map((chart, index) => {
                  return (
                    <React.Fragment key={index}>
                      <Col {...chart.colProps}>{renderChart(chart)}</Col>
                    </React.Fragment>
                  );
                })}
              </Row>
            </ShadowCard>
          </Col>
        )}
        {introductions && (
          <Col span={24}>
            <Row gutter={[16, 16]}>
              {introductions.map((i, index) => (
                <Col {...colProps2} key={index}>
                  {i}
                </Col>
              ))}
            </Row>
          </Col>
        )}
        {tabs && <Col span={24}>{tabs}</Col>}
        <Col span={24}>{props.children}</Col>
      </Row>
    </>
  );
};
