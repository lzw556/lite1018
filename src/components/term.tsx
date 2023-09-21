import { QuestionCircleOutlined } from '@ant-design/icons';
import { Space, Tooltip } from 'antd';
import React from 'react';

export const Term = ({ name, description }: { name: string; description: string }) => {
  return (
    <Space>
      {name}
      <Tooltip placement='top' title={description.length === 0 ? name : description}>
        <QuestionCircleOutlined />
      </Tooltip>
    </Space>
  );
};
