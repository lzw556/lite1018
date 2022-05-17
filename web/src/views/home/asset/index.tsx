import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, ButtonProps, Empty, Popconfirm, Space, TableProps } from 'antd';
import * as React from 'react';
import { SearchResultPage } from '../searchResultPage';
import { AssetTypes } from './constants';
import { AssetEdit } from './edit';
import { AssetRow } from './props';
import { deleteAsset, getAssets } from './services';

const AssetManagement: React.FC = () => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<AssetRow>();
  const [initialValues, setInitialValues] = React.useState(AssetTypes.WindTurbind);
  const [assets, setAssets] = React.useState<AssetRow[]>([]);
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
    rowKey: 'ID',
    columns: [
      { title: '名称', dataIndex: 'Name', key: 'name', width: '50%' },
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
                deleteAsset(row.ID).then(() => {
                  fetchAssets();
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
                onClick={() => open({ ...AssetTypes.Flange, parent_id: row.ID })}
              />
            </Button>
          </Space>
        )
      }
    ],
    size: 'small',
    pagination: false,
    loading: !isLoaded,
    locale: { emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='暂无数据' /> }
  });
  const open = (initialValues: typeof AssetTypes.WindTurbind, selectedRow?: AssetRow) => {
    setInitialValues(initialValues);
    setSelectedRow(selectedRow);
    setVisible(true);
  };

  const fetchAssets = () => {
    setIsLoaded(false);
    getAssets()
      .then(setAssets)
      .then(() => setIsLoaded(true));
  };
  React.useEffect(() => {
    fetchAssets();
  }, []);

  React.useEffect(() => {
    const dataSource = assets.filter((asset) => asset.Type === AssetTypes.WindTurbind.type);
    setResult((prev) => ({
      ...prev,
      dataSource,
      loading: !isLoaded
    }));
    if (isLoaded) {
      setDisabled(dataSource.length === 0);
    }
  }, [assets, isLoaded]);

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
              fetchAssets();
              setVisible(false);
            }
          }}
        />
      )}
    </SearchResultPage>
  );
};

export default AssetManagement;
