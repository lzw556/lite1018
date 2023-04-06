import { Col, Empty, Row } from 'antd';
import React from 'react';
import ShadowCard from '../../../components/shadowCard';
import { generateColProps } from '../../../utils/grid';
import { sortFlangesByAttributes, FlangeCard } from '../../flange';
import { AssetRow } from '../types';
import intl from 'react-intl-universal';

export const WindTurbineMonitor = (wind: AssetRow) => {
  if (wind.children === undefined || wind.children.length === 0)
    return (
      <ShadowCard>
        <Empty
          description={intl.get('NO_ASSET_PROMPT', { assetTypeLabel: intl.get('FLANGE') })}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
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
