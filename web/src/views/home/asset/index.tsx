import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, ButtonProps, Empty, Popconfirm, Space, TableProps } from 'antd';
import * as React from 'react';
import { SearchResultPage } from '../searchResultPage';
import { filterEmptyChildren, getAssetType } from '../utils';
import { AssetTypes } from '../constants';
import { AssetEdit } from './edit';
import { AssetRow, transformAssetStatistics } from './props';
import { deleteAsset, getAssets } from './services';
import { Link } from 'react-router-dom';

const AssetManagement: React.FC = () => {
  const [assets, setAssets] = React.useState<{
    loading: boolean;
    items: AssetRow[];
  }>({
    loading: true,
    items: []
  });
  const [visible, setVisible] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<AssetRow>();
  const [initialValues, setInitialValues] = React.useState(AssetTypes.WindTurbind);
  const [disabled, setDisabled] = React.useState(true);
  const actions: ButtonProps[] = [
    {
      type: 'primary',
      children: React.Children.toArray(['添加风机', <PlusOutlined />]),
      onClick: () => open(AssetTypes.WindTurbind)
    },
    {
      type: 'primary',
      children: React.Children.toArray(['添加法兰', <PlusOutlined />]),
      onClick: () => open(AssetTypes.Flange),
      disabled
    }
  ];
  const [result, setResult] = React.useState<TableProps<any>>({
    rowKey: (row: AssetRow) => row.id + row.type,
    columns: [
      {
        title: '名称', dataIndex: 'name', key: 'name', width: 200, render: (name: string, row: AssetRow) => {
          const assetType = getAssetType(row.type);
          const hasChildren = ((row.monitoringPoints && row.monitoringPoints.length) || (row.children && row.children.length))
          return assetType && hasChildren ? <Link to={`${assetType.url}&id=${row.id}`}>{name}</Link> : name
        }
      },
      {
        title: '数据', dataIndex: 'data', key: 'data', width: 400, render: (name: string, row: AssetRow) => {
          const { alarmState, statistics } = transformAssetStatistics(
            row.statistics,
            'monitoringPointNum',
            ['anomalous', '异常监测点'],
            'deviceNum',
            'offlineDeviceNum'
          );
          return statistics.map(({ name, value }) => `${name}: ${value}`).join(',')
        }
      },
      {
        title: '操作',
        key: 'action',
        render: (x, row: AssetRow) => {
          const assetType = getAssetType(row.type);
          const name = assetType ? assetType.label : '风机';
          return (
            <Space>
              <Button type='text' size='small' title={`编辑${name}`}>
                <EditOutlined onClick={() => assetType && open(assetType, row)} />
              </Button>
              <Popconfirm
                title={`确定要删除该${name}吗?`}
                onConfirm={() => {
                  deleteAsset(row.id).then(() => {
                    fetchAssets({ type: AssetTypes.WindTurbind.id });
                  });
                }}
              >
                <Button type='text' danger={true} size='small' title={`删除${name}`}>
                  <DeleteOutlined />
                </Button>
              </Popconfirm>
              {row.type === AssetTypes.WindTurbind.id && (
                <Button type='text' size='small' title='添加法兰'>
                  <PlusOutlined
                    style={{ color: 'rgba(0,0,0,.55)' }}
                    onClick={() => open({ ...AssetTypes.Flange, parent_id: row.id })}
                  />
                </Button>
              )}
            </Space>
          )
        }
      }
    ],
    size: 'small',
    pagination: false,
    loading: true,
    locale: { emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='暂无数据' /> }
  });
  const open = (initialValues: typeof AssetTypes.WindTurbind, selectedRow?: AssetRow) => {
    setInitialValues(initialValues);
    setSelectedRow(selectedRow);
    setVisible(true);
  };

  const fetchAssets = (filters?: Pick<AssetRow, 'type'>) => {
    setAssets((prev) => ({ ...prev, loading: true }));
    getAssets(filters).then((assets) => setAssets({ loading: false, items: assets }));
  };
  React.useEffect(() => {
    fetchAssets({ type: AssetTypes.WindTurbind.id });
  }, []);

  React.useEffect(() => {
    setResult((prev) => ({
      ...prev,
      loading: assets.loading,
      dataSource: filterEmptyChildren(assets.items)
    }));
    if (!assets.loading) {
      setDisabled(assets.items.length === 0);
    }
  }, [assets]);

  return (
    <SearchResultPage {...{ actions, result }}>
      {visible && (
        <AssetEdit
          {...{
            visible,
            onCancel: () => setVisible(false),
            selectedRow,
            initialValues,
            onSuccess: () => {
              fetchAssets({ type: AssetTypes.WindTurbind.id });
              setVisible(false);
            }
          }}
        />
      )}
    </SearchResultPage>
  );
};

export default AssetManagement;
