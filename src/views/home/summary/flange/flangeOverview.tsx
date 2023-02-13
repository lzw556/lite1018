import { Button, Form, Spin } from 'antd';
import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { AssetNavigator } from '../../components/assetNavigator';
import '../../home.css';
import { MeasurementRow } from '../measurement/props';
import { getAsset, updateAsset } from '../../assetList/services';
import { OverviewPage } from '../../components/overviewPage';
import { getAssetStatistics, NameValue } from '../../common/statisticsHelper';
import { MeasurementOfFlangeList } from '../measurement/measurementOfFlangeList';
import { AssetRow, convertRow } from '../../assetList/props';
import { MonitorTabContent } from './monitorTabContent';
import { SettingsTabContent } from '../settingsTabContent';
import { PlusOutlined } from '@ant-design/icons';
import HasPermission from '../../../../permission';
import usePermission, { Permission } from '../../../../permission/permission';
import { HistoryData } from './historyData';
import { ActionBar } from '../../components/actionBar';
import { useActionBarStatus } from '../../common/useActionBarStatus';
import { FlangeStatus } from './FlangeStatus';

const FlangeOverview: React.FC = () => {
  const { search, pathname } = useLocation();
  const id = Number(search.substring(search.lastIndexOf('id=') + 3));
  const [asset, setAsset] = React.useState<AssetRow>();
  const [loading, setLoading] = React.useState(true);
  const [measurements, setMeasurements] = React.useState<MeasurementRow[]>();
  const [statistics, setStatistics] = React.useState<NameValue[]>();
  const [form] = Form.useForm<any>();
  const [isForceRefresh, setIsForceRefresh] = React.useState(0);
  const { hasPermission } = usePermission();
  const actionStatus = useActionBarStatus();

  let tabs = [
    {
      key: 'monitor',
      tab: '监控',
      content: (
        <MonitorTabContent
          measurements={measurements || []}
          pathname={pathname}
          search={search}
          asset={asset}
        />
      )
    },
    {
      key: 'list',
      tab: '监测点列表',
      content: (
        <MeasurementOfFlangeList
          flange={asset}
          pathname={pathname}
          search={search}
          handleMeasurementEdit={actionStatus.handleMeasurementEdit}
          fetchAssets={() => {
            fetchAsset(id);
          }}
        />
      )
    }
  ];
  const [tabKey, setTabKey] = React.useState(tabs[0].key);

  React.useEffect(() => {
    fetchAsset(id, form);
  }, [id, form]);

  React.useEffect(() => {
    if (asset) {
      const { statistics, monitoringPoints } = asset;
      setStatistics(
        getAssetStatistics(
          statistics,
          'monitoringPointNum',
          ['danger', '紧急报警监测点'],
          ['warn', '重要报警监测点'],
          ['info', '次要报警监测点'],
          'deviceNum',
          'offlineDeviceNum'
        ).statistics
      );
      setMeasurements(monitoringPoints);
    }
  }, [asset]);

  const fetchAsset = (id: number, form?: any) => {
    getAsset(id).then((asset) => {
      setLoading(false);
      setAsset(asset);
      if (form) form.setFieldsValue(convertRow(asset));
    });
  };

  if (loading) return <Spin />;

  if (asset)
    tabs = [...tabs, { key: 'history', tab: '历史数据', content: <HistoryData {...asset} /> }];
  if (asset && asset.attributes && asset.attributes.sub_type === 1) {
    tabs = [
      ...tabs,
      { key: 'flangeSatus', tab: '法兰螺栓状态', content: <FlangeStatus {...asset} /> }
    ];
  }
  return (
    <>
      {asset && (
        <AssetNavigator id={asset.id} parentId={asset.parentId} isForceRefresh={isForceRefresh} />
      )}
      <OverviewPage
        {...{
          statistics,
          tabs: hasPermission(Permission.AssetEdit)
            ? tabs.concat([
                {
                  key: 'settings',
                  tab: '配置信息',
                  content: (
                    <SettingsTabContent
                      asset={asset}
                      form={form}
                      onSubmit={(values) => {
                        const _values = {
                          ...values,
                          attributes: {
                            ...values.attributes,
                            monitoring_points_num: Number(values.attributes?.monitoring_points_num),
                            sub_type: Number(values.attributes?.sub_type),
                            initial_preload: Number(values.attributes?.initial_preload),
                            initial_pressure: Number(values.attributes?.initial_pressure)
                          }
                        };
                        updateAsset(id, _values).then(() => {
                          fetchAsset(id);
                          setIsForceRefresh((prev) => ++prev);
                        });
                      }}
                    />
                  )
                }
              ])
            : tabs,
          tabBarExtraContent: tabKey === 'list' && (
            <HasPermission value={Permission.MeasurementAdd}>
              <ActionBar
                actions={[
                  <Button
                    type='primary'
                    onClick={() => actionStatus.handleAddMeasurements({ asset })}
                  >
                    添加监测点
                    <PlusOutlined />
                  </Button>
                ]}
                {...actionStatus}
                onSuccess={() => fetchAsset(id)}
              />
            </HasPermission>
          ),
          onTabChange: (key) => setTabKey(key)
        }}
      />
    </>
  );
};

export default FlangeOverview;
