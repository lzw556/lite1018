import React from 'react';
import { Space } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import { ChartSettingsBtn } from './chartSettingsBtn';
import { subs } from '.';
import { ChartSettings } from './useAnalysis';
import { saveAsImage } from '../../../../../utils/image';

export const ChartHead = ({
  activeKey,
  chartInstance,
  extra,
  showToolbar = false,
  title,
  toolbar,
  onSaveAsImage,
  onSetChartSettings
}: {
  activeKey?: string;
  chartInstance?: any;
  extra?: React.ReactNode;
  showToolbar?: boolean;
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
      {extra}
      <div style={{ flex: 1 }}></div>
      {showToolbar && (
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
      )}
    </div>
  );
};
