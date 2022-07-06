import { Button, Empty, Form, Spin } from 'antd';
import * as React from 'react';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { AssetNavigator } from '../../components/assetNavigator';
import '../../home.css';
import { MeasurementRow } from '../measurement/props';
import { getAsset, updateAsset } from '../../assetList/services';
import { OverviewPage } from '../../components/overviewPage';
import { getAssetStatistics, NameValue } from '../../common/statisticsHelper';
import { MeasurementOfFlangeList } from '../measurement/measurementOfFlangeList';
import { MeasurementEdit } from '../../measurementList/edit';
import { AssetRow, convertRow } from '../../assetList/props';
import { MonitorTabContent } from './monitorTabContent';
import { SettingsTabContent } from '../settingsTabContent';
import { PlusOutlined } from '@ant-design/icons';

const FlangeOverview: React.FC = () => {
  const { search, pathname } = useLocation();
  const history = useHistory();
  const id = Number(search.substring(search.lastIndexOf('id=') + 3));
  const [asset, setAsset] = React.useState<AssetRow>();
  const [loading, setLoading] = React.useState(true);
  const [measurements, setMeasurements] = React.useState<MeasurementRow[]>();
  const [statistics, setStatistics] = React.useState<NameValue[]>();
  const [visible, setVisible] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<MeasurementRow>();
  const [form] = Form.useForm<any>();
  const [isForceRefresh, setIsForceRefresh] = React.useState(0);

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

  const open = (selectedRow?: MeasurementRow) => {
    setSelectedRow(selectedRow);
    setVisible(true);
  };

  if (loading) return <Spin />;
  //TODO
  if (!measurements || measurements.length === 0)
    return (
      <Empty
        description={
          <p>
            还没有监测点, 去
            <Link to='/measurement-management?locale=measurement-management'>创建</Link>, 或
            <a
              href='#!'
              onClick={(e) => {
                history.go(-1);
                e.preventDefault();
              }}
            >
              返回
            </a>
          </p>
        }
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );

  return (
    <>
      {asset && (
        <AssetNavigator id={asset.id} parentId={asset.parentId} isForceRefresh={isForceRefresh} />
      )}
      <OverviewPage
        {...{
          statistics,
          tabs: [
            {
              key: 'monitor',
              tab: '监控',
              content: (
                <MonitorTabContent
                  measurements={measurements}
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
                <>
                  <Button
                    type='primary'
                    style={{ position: 'fixed', top: 240, right: 25, zIndex: 10 }}
                    onClick={() => open()}
                  >
                    添加监测点
                    <PlusOutlined />
                  </Button>
                  <MeasurementOfFlangeList
                    flange={asset}
                    pathname={pathname}
                    search={search}
                    open={open}
                    fetchAssets={() => {
                      fetchAsset(id);
                    }}
                  />
                  {visible && (
                    <MeasurementEdit
                      {...{
                        visible,
                        onCancel: () => setVisible(false),
                        id: selectedRow?.id,
                        assetId: asset?.parentId,
                        onSuccess: () => {
                          fetchAsset(id);
                          setVisible(false);
                        }
                      }}
                    />
                  )}
                </>
              )
            },
            {
              key: 'settings',
              tab: '配置信息',
              content: (
                <SettingsTabContent
                  asset={asset}
                  form={form}
                  onSubmit={(values) => {
                    updateAsset(id, values).then(() => {
                      fetchAsset(id);
                      setIsForceRefresh((prev) => ++prev);
                    });
                  }}
                />
              )
            }
          ]
        }}
      />
    </>
  );
};

export default FlangeOverview;
