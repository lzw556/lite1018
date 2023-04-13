import React from 'react';
import './name-values.css';
import { Col, ColProps, Row, RowProps } from 'antd';

export const NameValueGroups = ({
  items,
  namePercentage,
  col,
  gutter,
  divider
}: {
  className?: string;
  namePercentage?: number;
  divider?: number;
  col?: ColProps;
  gutter?: RowProps['gutter'];
  items: { name: string; value: React.ReactNode; className?: string }[];
}) => {
  let nameStyle: React.CSSProperties | undefined,
    valueStyle: React.CSSProperties | undefined = undefined;
  if (namePercentage) {
    nameStyle = { flexBasis: `${namePercentage}%` };
    valueStyle = { flexBasis: `${100 - namePercentage}%` };
  }
  return (
    <dl className='name-value-groups'>
      <Row gutter={gutter}>
        {items.map(({ name, value, className }) => (
          <Col
            className={`${className ? `name-value ${className}` : 'name-value'}`}
            key={name}
            {...(col ? col : { span: 24 })}
          >
            <dt style={{ ...nameStyle }}>{name}</dt>
            <dd style={{ flex: '1 1 auto' }}></dd>
            <dd style={{ ...valueStyle }}>{value}</dd>
            {divider && <dd style={{ flex: `0 0 ${divider}%` }}></dd>}
          </Col>
        ))}
      </Row>
    </dl>
  );
};
