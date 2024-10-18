import React from 'react';
import { Card as AntCard, CardProps as AntCardProps } from 'antd';

export type CardProps = AntCardProps & { shadow?: boolean };

export const Card = (props: CardProps & { shadow?: boolean }) => {
  const { className, shadow, styles, ...rest } = props;

  return (
    <AntCard
      {...rest}
      className={shadow ? `${className} 'ts-card-shadow'` : className}
      styles={{
        ...styles,
        header: { padding: '0 12px', minHeight: 46 + 1, ...styles?.header },
        body: { padding: 12, ...styles?.body }
      }}
    />
  );
};

Card.Grid = AntCard.Grid;
Card.Meta = AntCard.Meta;
