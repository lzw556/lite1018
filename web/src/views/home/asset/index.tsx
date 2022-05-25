import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, ButtonProps, Empty, Popconfirm, Space, TableProps } from 'antd';
import { forEach } from 'lodash';
import * as React from 'react';
import { SearchResultPage } from '../searchResultPage';
import { filterEmptyChildren } from '../utils';
import { AssetTypes } from './constants';
import { AssetEdit } from './edit';
import { AssetRow } from './props';
import { deleteAsset, getAssets } from './services';

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
      { title: '名称', dataIndex: 'name', key: 'name', width: '50%' },
      {
        title: '操作',
        key: 'action',
        render: (row: AssetRow) => (
          <Space>
            <Button type='text' size='small' title='编辑风机'>
              <EditOutlined onClick={() => open(AssetTypes.WindTurbind, row)} />
            </Button>
            <Popconfirm
              title={'确定要删除该风机吗?'}
              onConfirm={() => {
                deleteAsset(row.id).then(() => {
                  fetchAssets({ type: AssetTypes.WindTurbind.type });
                });
              }}
            >
              <Button type='text' danger={true} size='small' title='删除风机'>
                <DeleteOutlined />
              </Button>
            </Popconfirm>
            <Button type='text' size='small' title='添加法兰'>
              <PlusOutlined
                style={{ color: 'rgba(0,0,0,.55)' }}
                onClick={() => open({ ...AssetTypes.Flange, parent_id: row.id })}
              />
            </Button>
          </Space>
        )
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
    fetchAssets({ type: AssetTypes.WindTurbind.type });
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
              fetchAssets({ type: AssetTypes.WindTurbind.type });
              setVisible(false);
            }
          }}
        />
      )}
    </SearchResultPage>
  );
};

export default AssetManagement;
