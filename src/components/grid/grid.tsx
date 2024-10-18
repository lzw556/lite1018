import React from 'react';
import { Row, RowProps } from 'antd';
import './style.css';

export const Grid = (props: RowProps) => {
  const { gutter = [0, 12], style, ...rest } = props;
  return <Row {...rest} gutter={gutter} style={{ marginLeft: 0, marginRight: 0, ...style }} />;
};
