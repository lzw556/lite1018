import React from 'react';
import { Flex as AntFlex, FlexProps } from 'antd';

export const Flex = ({ justify = 'flex-end', ...rest }: FlexProps) => {
  return <AntFlex {...rest} justify={justify} />;
};
