import { ExportOutlined, ImportOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, message, Space, Upload } from 'antd';
import * as React from 'react';
import { getFilename } from '../common/utils';
import { AssetTypes } from '../common/constants';
import { AssetEdit } from './edit';
import { exportAssets, getAssets, importAssets } from './services';
import { SearchResultPage } from '../components/searchResultPage';
import { filterEmptyChildren } from '../common/treeDataHelper';
import { getProject } from '../../../utils/session';
import { AssetRow } from './props';
import '../home.css';
import { AssetTree } from './assetTree';

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
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    fetchAssets({ type: AssetTypes.WindTurbind.id });
  }, []);

  const open = (initialValues: typeof AssetTypes.WindTurbind, selectedRow?: AssetRow) => {
    setInitialValues(initialValues);
    setSelectedRow(selectedRow);
    setVisible(true);
  };

  const fetchAssets = (filters?: Pick<AssetRow, 'type'>) => {
    setAssets((prev) => ({ ...prev, loading: true }));
    getAssets(filters).then((assets) => {
      setAssets({ loading: false, items: filterEmptyChildren(assets) });
    });
  };

  return (
    <SearchResultPage
      {...{
        actions: (
          <Space>
            <Button type='primary' onClick={() => open(AssetTypes.WindTurbind)}>
              添加风机
              <PlusOutlined />
            </Button>
            <Button
              type='primary'
              onClick={() => {
                exportAssets(getProject()).then((res) => {
                  const url = window.URL.createObjectURL(new Blob([res.data]));
                  const link = document.createElement('a');
                  link.href = url;
                  link.setAttribute('download', getFilename(res));
                  document.body.appendChild(link);
                  link.click();
                });
              }}
            >
              导出配置
              <ExportOutlined />
            </Button>
            <Upload
              {...{
                showUploadList: false,
                children: (
                  <Button type='primary' loading={loading}>
                    导入配置
                    <ImportOutlined />
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
              }}
            >
              <Button type='primary' loading={loading}>
                导入配置
                <ImportOutlined />
              </Button>
            </Upload>
          </Space>
        ),
        results: <AssetTree assets={assets.items} />
      }}
    >
      {visible && (
        <AssetEdit
          {...{
            visible,
            onCancel: () => setVisible(false),
            id: selectedRow?.id,
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
