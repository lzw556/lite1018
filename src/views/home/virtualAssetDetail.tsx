import React from 'react';
import { Button, message, Space } from 'antd';
import { DownloadOutlined, ExportOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import { Card } from '../../components';
import { NameValueGroups } from '../../components/name-values';
import { FileInput } from '../../components/fileInput';
import { getProject } from '../../utils/session';
import { generateColProps } from '../../utils/grid';
import { useAppType } from '../../config';
import * as Area from '../asset-area';
import * as Wind from '../app-wind-turbine';
import {
  Asset,
  ASSET_PATHNAME,
  getVirturalAsset,
  importAssets,
  Introduction,
  INVALID_MONITORING_POINT,
  OverviewPage,
  useContext
} from '../asset-common';
import { AlarmTrend } from './alarmTrend';
import { Icon } from './icon';
import { useProjectStatistics } from './useProjectStatistics';
import { BatchDownlaodHistoryDataModal } from './batchDownlaodHistoryDataModal';
import { SelectAssets } from './selectAssets';

export const VirtualAssetDetail = () => {
  const { assets, refresh } = useContext();
  const appType = useAppType();
  const [open, setOpen] = React.useState(false);
  const [type, setType] = React.useState<string | undefined>();
  const commonProps = {
    assets,
    open,
    onCancel: () => {
      setOpen(false);
      setType(undefined);
    }
  };

  const renderActionBar = () => {
    const props = { onSuccess: refresh, short: true };
    if (appType === 'windTurbine' || appType === 'windTurbinePro' || appType === 'hydroTurbine') {
      return <Wind.ActionBar {...props} />;
    } else if (
      appType === 'corrosion' ||
      appType === 'corrosionWirelessHART' ||
      appType === 'vibration'
    ) {
      return <Area.ActionBar {...props} />;
    } else {
      return (
        <>
          <Wind.ActionBar {...props} />
          <Area.ActionBar {...props} />
        </>
      );
    }
  };

  return (
    <Card
      extra={
        <Space>
          {renderActionBar()}
          {assets.length > 0 && (
            <>
              <Button
                onClick={() => {
                  setOpen(true);
                  setType('download');
                }}
                type='primary'
                title={intl.get('BATCH_DOWNLOAD')}
              >
                {intl.get('BATCH_DOWNLOAD')}
                <DownloadOutlined />
              </Button>
              {open && type === 'download' && <BatchDownlaodHistoryDataModal {...commonProps} />}
              <Button
                onClick={() => {
                  setOpen(true);
                  setType('export');
                }}
                type='primary'
                title={intl.get('EXPORT_SETTINGS')}
              >
                {intl.get('EXPORT_SETTINGS')}
                <ExportOutlined />
              </Button>
              {open && type === 'export' && <SelectAssets {...commonProps} onSuccess={refresh} />}
              <FileInput
                onUpload={(data: any) => {
                  return importAssets(getProject().id, data).then((res) => {
                    if (res.data.code === 200) {
                      message.success(intl.get('IMPORTED_SUCCESSFUL'));
                      refresh();
                    } else {
                      message.error(`${intl.get('FAILED_TO_IMPORT')}: ${res.data.msg}`);
                    }
                  });
                }}
              />
            </>
          )}
        </Space>
      }
      styles={{ body: { padding: 0 } }}
      title={getVirturalAsset().root.name}
    >
      <OverviewPage
        {...{
          charts: [
            ...useProjectStatistics('d'),
            {
              colProps: generateColProps({ xl: 24, xxl: 9 }),
              render: <AlarmTrend title={intl.get('ALARM_TREND')} />
            }
          ],
          introductions: assets.map((item) => {
            const { alarmState, statistics } = Asset.resolveStatistics(
              item.statistics,
              ['monitoringPointNum', intl.get('MONITORING_POINT')],
              ['anomalous', intl.get(INVALID_MONITORING_POINT)],
              ['deviceNum', intl.get('DEVICE')],
              ['offlineDeviceNum', intl.get('OFFLINE_DEVICE')]
            );
            return (
              <Introduction
                {...{
                  className: 'shadow',
                  count: <NameValueGroups items={statistics} col={{ span: 18 }} />,
                  title: {
                    name: item.name,
                    path: `/${ASSET_PATHNAME}/${item.id}-${item.type}`,
                    state: [`${item.id}-${item.type}`]
                  },
                  alarmState,
                  icon: {
                    svg: <Icon node={item} style={{ fill: '#fff' }} />,
                    small: true
                  }
                }}
              />
            );
          })
        }}
      />
    </Card>
  );
};
