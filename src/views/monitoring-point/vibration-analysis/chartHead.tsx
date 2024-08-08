import React from 'react';
import { Space } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import { saveAsImage } from '../../../utils/image';
import { ChartSettingsBtn } from './chartSettingsBtn';
import { subs } from '.';
import { ChartSettings } from './useAnalysis';

export const ChartHead = ({
  activeKey,
  chartInstance,
  title,
  toolbar,
  onSaveAsImage,
  onSetChartSettings
}: {
  activeKey?: string;
  chartInstance?: any;
  title?: string;
  toolbar?: React.ReactElement;
  onSaveAsImage?: (title: string) => void;
  onSetChartSettings?: (settings: ChartSettings) => void;
}) => {
  const subTitle = subs.find((s) => s.key === activeKey)?.label;
  const _title = intl.get(title ?? subTitle ?? '');
  return (
    <div className='chart-card-head'>
      <span>{_title}</span>
      <div style={{ flex: 1 }}></div>
      <Space className='toolbar' size={3}>
        {activeKey && (
          <ChartSettingsBtn activeKey={activeKey} onSetChartSettings={onSetChartSettings} />
        )}
        {toolbar}
        <DownloadOutlined
          onClick={() => {
            if (chartInstance) {
              saveAsImage(
                chartInstance.getEchartsInstance().getDataURL({ backgroundColor: '#fff' }),
                _title
              );
            } else if (onSaveAsImage) {
              onSaveAsImage(_title);
            }
          }}
        />
      </Space>
    </div>
  );
};
