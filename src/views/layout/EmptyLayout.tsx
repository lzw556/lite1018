import { Empty, EmptyProps } from 'antd';

export interface EmptyLayoutProps extends EmptyProps {
  description: string;
}

const EmptyLayout = (props: EmptyLayoutProps) => {
  const { description, children } = props;
  return (
    <Empty {...props} image={Empty.PRESENTED_IMAGE_SIMPLE} description={<p>{description}</p>}>
      {children}
    </Empty>
  );
};

export default EmptyLayout;
