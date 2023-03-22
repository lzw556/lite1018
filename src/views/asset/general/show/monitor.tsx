import { Col, Empty, Row } from 'antd';
import React from 'react';
import ShadowCard from '../../../../components/shadowCard';
import { generateColProps } from '../../../../utils/grid';
import { NO_FLANGES, sortFlangesByAttributes, FlangeCard } from '../../../flange';
import { AssetRow } from '../../types';
import intl from 'react-intl-universal';

export const GeneralMonitor = (wind: AssetRow) => {
  if (wind.children === undefined || wind.children.length === 0)
    return (
      <ShadowCard>
        <Empty description={NO_FLANGES} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </ShadowCard>
    );

  return (
    <Row gutter={[16, 16]}>
      {sortFlangesByAttributes(wind.children).map((a) => (
        <Col {...generateColProps({ md: 12, lg: 12, xl: 12, xxl: 8 })} key={a.id}>
          <FlangeCard {...a} />
        </Col>
      ))}
    </Row>
  );
};
