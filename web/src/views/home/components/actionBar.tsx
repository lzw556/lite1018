import { PlusOutlined } from '@ant-design/icons';
import { Button, message, Space } from 'antd';
import * as React from 'react';
import { getProject } from '../../../utils/session';
import { AssetEdit } from '../assetList/edit';
import { AssetRow } from '../assetList/props';
import { importAssets } from '../assetList/services';
import { AssetTypes } from '../common/constants';
import { MeasurementEdit } from '../measurementList/edit';
import { MeasurementRow } from '../summary/measurement/props';
import { AssetExport } from './assetExport';
import { FileInput } from './fileInput';

export const ActionBar: React.FC<{
  assets: AssetRow[];
  visible?: boolean;
  setVisible?: React.Dispatch<React.SetStateAction<boolean>>;
  visibleAsset?: boolean;
  setVisibleAsset?: React.Dispatch<React.SetStateAction<boolean>>;
  selectedMeasurement?: MeasurementRow;
  selectedAsset?: AssetRow;
  initialValues?: typeof AssetTypes.WindTurbind;
  assetId?: number;
  flangeId?: number;
  onEdit?: (
    selectedMeasurement?: MeasurementRow,
    selectedAsset?: AssetRow,
    initialValues?: typeof AssetTypes.WindTurbind
  ) => void;
  onSuccess?: () => void;
  hides?: [boolean, boolean, boolean, boolean, boolean];
}> = (props) => {
  const {
    assets,
    visible,
    setVisible,
    visibleAsset,
    setVisibleAsset,
    selectedAsset,
    selectedMeasurement,
    initialValues,
    assetId,
    flangeId,
    onEdit,
    onSuccess,
    hides
  } = props;

  const handleUpload = (data: any) => {
    return importAssets(getProject(), data).then((res) => {
      if (res.data.code === 200) {
        message.success('导入成功');
        if (onSuccess) onSuccess();
      } else {
        message.error(`导入失败: ${res.data.msg}`);
      }
    });
  };

  const isHideWindAddBtn = hides && hides.length === 5 && hides[0];
  const isHideFlangeAddBtn = hides && hides.length === 5 && hides[1];
  const isHideMeasurementAddBtn = hides && hides.length === 5 && hides[2];
  const isHideExportBtn = hides && hides.length === 5 && hides[3];
  const isHideImportBtn = hides && hides.length === 5 && hides[4];

  return (
    <Space>
      {!isHideWindAddBtn && (
        <Button
          type='primary'
          onClick={() => {
            if (onEdit) onEdit(undefined, undefined, AssetTypes.WindTurbind);
          }}
        >
          添加风机
          <PlusOutlined />
        </Button>
      )}
      {!isHideFlangeAddBtn && (
        <Button
          type='primary'
          onClick={() => {
            if (onEdit) onEdit(undefined, undefined, AssetTypes.Flange);
          }}
          disabled={assets.length === 0}
        >
          添加法兰
          <PlusOutlined />
        </Button>
      )}
      {!isHideMeasurementAddBtn && (
        <Button
          type='primary'
          onClick={() => {
            if (onEdit) onEdit();
          }}
          disabled={
            assets.filter((asset) => asset.children && asset.children.length > 0).length === 0
          }
        >
          添加监测点
          <PlusOutlined />
        </Button>
      )}
      {assets.length > 0 && !isHideExportBtn && <AssetExport winds={assets} />}
      {!isHideImportBtn && <FileInput onUpload={handleUpload} />}
      {visibleAsset && (
        <AssetEdit
          {...{
            visible: visibleAsset,
            onCancel: () => setVisibleAsset && setVisibleAsset(false),
            initialValues,
            id: selectedAsset?.id,
            onSuccess: () => {
              if (onSuccess) onSuccess();
              setVisibleAsset && setVisibleAsset(false);
            }
          }}
        />
      )}
      {visible && (
        <MeasurementEdit
          {...{
            visible,
            onCancel: () => setVisible && setVisible(false),
            id: selectedMeasurement?.id,
            assetId,
            flangeId,
            onSuccess: () => {
              if (onSuccess) onSuccess();
              setVisible && setVisible(false);
            }
          }}
        />
      )}
    </Space>
  );
};
