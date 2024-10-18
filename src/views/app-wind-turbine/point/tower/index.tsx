import React from 'react';
import { Col, Row } from 'antd';
import { MonitoringPointTypeValue } from '../../../../config';
import { Point } from '../../../asset-common';
import { InstallAngletItem } from './installAngleItem';
import { RadiusItem } from './tower-base-settlement/radiusItem';
import { InstallHeightItem } from './tower-inclination/installHeightItem';

export const Index = (props: {
  mode: 'create' | 'update';
  name?: number;
  restFields?: {
    fieldKey?: number | undefined;
  };
  type: number;
}) => {
  const { type, ...rest } = props;
  const isTowerRelated = Point.Assert.isTowerRelated(type);
  if (isTowerRelated) {
    if (props.mode === 'create') {
      return (
        <Row>
          <Col span={12}>
            <InstallAngletItem {...rest} />
          </Col>
          {type === MonitoringPointTypeValue.TOWER_INCLINATION ? (
            <InstallHeightItem {...rest} />
          ) : (
            <RadiusItem {...rest} />
          )}
        </Row>
      );
    } else {
      return (
        <>
          <InstallAngletItem {...rest} />
          {type === MonitoringPointTypeValue.TOWER_INCLINATION ? (
            <InstallHeightItem {...rest} />
          ) : (
            <RadiusItem {...rest} />
          )}
        </>
      );
    }
  } else {
    return null;
  }
};
