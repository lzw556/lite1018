import React from 'react';
import { Card, Tabs, TabsProps } from 'antd';

export const TabsCard = ({ items, ...props }: TabsProps) => {
  return (
    <Card bodyStyle={{ paddingTop: 0 }}>
      <Tabs items={items} {...props} />
    </Card>
  );
};
