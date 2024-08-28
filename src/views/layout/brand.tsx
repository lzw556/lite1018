import { Space } from 'antd';
import * as React from 'react';
import useImage from 'use-image';
import { SITE_NAMES } from '../../config/assetCategory.config';
import { useAppConfigContext } from '../asset/components/appConfigContext';
import intl from 'react-intl-universal';

export const Brand: React.FC<{
  className?: string;
  height?: number;
  width?: number;
  logoImgAlt?: string;
  brandNameStyle: React.CSSProperties;
  gap?: number;
}> = ({ className, height, width, logoImgAlt, brandNameStyle, gap = 30 }) => {
  const config = useAppConfigContext();
  const [image, status] = useImage('res/logo.png');

  return (
    <Space size={gap} className={className}>
      {status === 'loaded' && (
        <img
          src={image?.src}
          alt={logoImgAlt || 'logo'}
          style={{ width, height, display: 'block' }}
        />
      )}
      <strong style={{ ...brandNameStyle, color: '#fff' }} className='title'>
        {intl.get(SITE_NAMES.get(config.type) ?? '')}
      </strong>
    </Space>
  );
};
