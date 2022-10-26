import { Card, CardProps } from 'antd';
import { FC } from 'react';
import './index.css';

export interface ShadowCardProps extends CardProps {}

const ShadowCard: FC<ShadowCardProps> = (props) => {
  const { children } = props;
  return (
    <Card {...props} className={'ts-card-shadow'}>
      {children}
    </Card>
  );
};

export default ShadowCard;
