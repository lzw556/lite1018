import { Col, Row, Statistic, Table, TableProps } from 'antd';
import * as React from 'react';
import ShadowCard from '../../../components/shadowCard';
import { generateColProps } from '../common/utils';
import { ChartContainer } from './charts/chartContainer';
import { ChartOptions } from './charts/common';
import '../home.css';
import { Introduction, IntroductionPage } from './introductionPage';
import { NameValue } from '../common/statisticsHelper';

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
  statistics?: NameValue[];
  chartList?: Chart[];
  introductionList?: Introduction[];
  tabelList?: TableListItem<any>[];
};
export const OverviewPage: React.FC<Overview> = (props) => {
  const { statistics, chartList, introductionList, tabelList } = props;
  const colProps = generateColProps({ md: 12, lg: 12, xl: 4, xxl: 4 });
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
    <Row gutter={[0, 16]}>
      {statistics && (
        <Col span={24} className='overview-statistic'>
          <ShadowCard>
            <Row>
              {statistics.map(({ name, value, className }, index) => (
                <Col span={4} key={index} {...colProps}>
                  <Statistic title={name} value={value} className={className} />
                </Col>
              ))}
            </Row>
          </ShadowCard>
        </Col>
      )}
      {chartList && (
        <Col span={24}>
          <ShadowCard>
            <Row>
              {chartList.map((chart, index) => {
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
      {introductionList && (
        <Col span={24}>
          <Row gutter={[16, 16]}>
            {introductionList.map((des) => (
              <Col {...(des.colProps || colProps2)} key={des.id}>
                <IntroductionPage {...des} />
              </Col>
            ))}
          </Row>
        </Col>
      )}
      {tabelList && (
        <Col span={24}>
          <Row gutter={[16, 16]}>
            {tabelList.map(({ colProps, ...props }, index) => (
              <Col key={index} {...colProps}>
                <Table {...props} />
              </Col>
            ))}
          </Row>
        </Col>
      )}
    </Row>
  );
};
