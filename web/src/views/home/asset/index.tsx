import {
  DeleteOutlined,
  EditOutlined,
  ExportOutlined,
  ImportOutlined,
  PlusOutlined
} from '@ant-design/icons';
import {
  Button,
  ButtonProps,
  Empty,
  message,
  Popconfirm,
  Space,
  Table,
  TableProps,
  UploadProps
} from 'antd';
import * as React from 'react';
import { combineFinalUrl, getFilename } from '../common/utils';
import { AssetTypes } from '../common/constants';
import { AssetEdit } from './edit';
import { AssetRow } from './props';
import { deleteAsset, exportAssets, getAssets, importAssets } from './services';
import { Link, useLocation } from 'react-router-dom';
import { SearchResultPage } from '../components/searchResultPage';
import { filterEmptyChildren } from '../common/treeDataHelper';
import { getAssetStatistics } from '../common/statisticsHelper';
import { getProject } from '../../../utils/session';

const AssetManagement: React.FC = () => {
  const { pathname, search } = useLocation();
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
  const [loading, setLoading] = React.useState(false);
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
    },
    {
      type: 'primary',
      children: React.Children.toArray(['导出', <ExportOutlined />]),
      onClick: () => {
        exportAssets(getProject()).then((res) => {
          const url = window.URL.createObjectURL(new Blob([res.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', getFilename(res));
          document.body.appendChild(link);
          link.click();
        });
      }
    }
  ];

  const uploads: UploadProps[] = [
    {
      showUploadList: false,
      children: (
        <Button type='primary' icon={<ImportOutlined />} loading={loading}>
          导入
        </Button>
      ),
      beforeUpload: (file) => {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => {
          try {
            const data = JSON.parse(reader.result as string);
            setLoading(true);
            importAssets(getProject(), data).then((res) => {
              setLoading(false);
              return new Promise<any>((resolve, reject) => {
                if (res.data.code === 200) {
                  message.success('导入成功');
                  fetchAssets({ type: AssetTypes.WindTurbind.id });
                  resolve(1);
                } else {
                  message.error(`导入失败: ${res.data.msg}`);
                  reject(res.data.msg);
                }
              });
            });
          } catch (error) {
            message.error('文件内部格式不正确');
          } finally {
            return false;
          }
        };
      }
    }
  ];

  const [result, setResult] = React.useState<TableProps<any>>({
    rowKey: (row: AssetRow) => `${row.id}-${row.type}`,
    columns: [
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
        width: 400,
        render: (name: string, row: AssetRow) => {
          const assetType = getAssetType(row.type);
          const hasChildren =
            (row.monitoringPoints && row.monitoringPoints.length) ||
            (row.children && row.children.length);
          return assetType && hasChildren ? (
            <Link to={combineFinalUrl(pathname, search, assetType.url, row.id)}>{name}</Link>
          ) : (
            name
          );
        }
      },
      {
        title: '类型',
        dataIndex: 'assetType',
        key: 'assetType',
        width: 200,
        render: (name: string, row: AssetRow) => {
          const assetType = getAssetType(row.type);
          const flangeType = row.attributes?.type;
          if (
            assetType &&
            assetType.id === AssetTypes.Flange.id &&
            flangeType &&
            assetType.categories
          ) {
            return (
              assetType.categories.find((cate) => cate.value === flangeType)?.label +
              AssetTypes.Flange.label
            );
          }
          return assetType?.label;
        }
      },
      {
        title: '监测点',
        dataIndex: 'measurementNum',
        key: 'measurementNum',
        width: 150,
        render: (name: string, row: AssetRow) => {
          const { statistics } = getAssetStatistics(row.statistics, 'monitoringPointNum');
          return statistics.length > 0 ? statistics[0].value : '-';
        }
      },
      {
        title: '异常监测点',
        dataIndex: 'errorMeasurementNum',
        key: 'errorMeasurementNum',
        width: 150,
        render: (name: string, row: AssetRow) => {
          const { statistics } = getAssetStatistics(row.statistics, ['anomalous', '异常监测点']);
          return statistics.length > 0 ? statistics[0].value : '-';
        }
      },
      {
        title: '传感器',
        dataIndex: 'sensorNum',
        key: 'sensorNum',
        width: 150,
        render: (name: string, row: AssetRow) => {
          const { statistics } = getAssetStatistics(row.statistics, 'deviceNum');
          return statistics.length > 0 ? statistics[0].value : '-';
        }
      },
      {
        title: '离线传感器',
        dataIndex: 'offlineNum',
        key: 'offlineNum',
        width: 150,
        render: (name: string, row: AssetRow) => {
          const { statistics } = getAssetStatistics(row.statistics, 'offlineDeviceNum');
          return statistics.length > 0 ? statistics[0].value : '-';
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
          );
        }
      }
    ],
    size: 'small',
    pagination: false,
    loading: true,
    locale: { emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='暂无数据' /> }
  });

  const getAssetType = (typeId: number) => {
    return Object.values(AssetTypes).find((type) => type.id === typeId);
  };

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
    <SearchResultPage {...{ actions, uploads, results: [<Table {...result} />] }}>
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
