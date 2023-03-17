import { Card, Tabs, TabsProps } from 'antd';
import React from 'react';

export const TabsCard = ({ items, ...props }: TabsProps) => {
  return (
    <Card bodyStyle={{ paddingTop: 0 }}>
      <Tabs items={items} {...props} tabBarStyle={{ marginBottom: 24 }} size='large' />
    </Card>
  );
};
