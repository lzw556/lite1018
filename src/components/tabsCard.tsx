import React from 'react';
import { Card, CardProps, Tabs, TabsProps } from 'antd';

export const TabsCard = ({ cardProps, items, ...props }: TabsProps & { cardProps?: CardProps }) => {
  return (
    <Card {...cardProps} bodyStyle={{ paddingTop: 0 }}>
      <Tabs items={items} {...props} />
    </Card>
  );
};
