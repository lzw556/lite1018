import React from 'react';
import { Card, CardProps, Tabs, TabsProps } from 'antd';

export const TabsCard = ({
  cardProps,
  items,
  tabsRighted,
  ...props
}: TabsProps & { cardProps?: CardProps; tabsRighted?: boolean }) => {
  const { className, ...rest } = props;
  let newClassName = className;
  if (tabsRighted) {
    newClassName = newClassName ? `${newClassName} ant-tabs-righted` : `ant-tabs-righted`;
  }
  return (
    <Card {...cardProps} bodyStyle={{ paddingTop: 0 }}>
      <Tabs items={items} {...{ ...rest, className: newClassName }} />
    </Card>
  );
};
