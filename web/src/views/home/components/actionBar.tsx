import { PlusOutlined } from '@ant-design/icons';
import { Button, Space } from 'antd';
import * as React from 'react';
import { AssetEdit } from '../assetList/edit';
import { AssetRow } from '../assetList/props';
import { AssetTypes } from '../common/constants';
import { MeasurementEdit } from '../measurementList/edit';
import { MeasurementRow } from '../summary/measurement/props';
import { AssetExport } from './assetExport';
import { AssetImport } from './assetImport';

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
    onSuccess
  } = props;

  return (
    <Space>
      <Button
        type='primary'
        onClick={() => {
          if (onEdit) onEdit(undefined, undefined, AssetTypes.WindTurbind);
        }}
      >
        添加风机
        <PlusOutlined />
      </Button>
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
      {assets.length > 0 && <AssetExport winds={assets} />}
      <AssetImport
        onSuccess={() => {
          if (onSuccess) onSuccess();
        }}
      />
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
