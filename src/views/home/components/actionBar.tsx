import { Space } from 'antd';
import * as React from 'react';
import { ChildAddition } from '../assetList/childAddition';
import { AssetEdit } from '../assetList/edit';
import { TopAssetEdit } from '../assetList/topAssetEdit';
import { WindEdit } from '../assetList/windEdit';
import { EditFormPayload } from '../common/useActionBarStatus';
import { MeasurementEdit } from '../measurementList/edit';
import { MeasurementBatchAddition } from '../measurementList/MeasurementBatchAddition';

export const ActionBar: React.FC<{
  actions: React.ReactNode[];
  visible?: boolean;
  setVisible?: React.Dispatch<React.SetStateAction<boolean>>;
  target?: number;
  payload?: EditFormPayload;
  onSuccess?: () => void;
  style?: React.CSSProperties;
}> = (props) => {
  const { actions, visible, setVisible, target, payload, onSuccess } = props;

  return (
    <Space wrap={true} style={props.style}>
      {actions}
      {visible && target === 0 && (
        <TopAssetEdit
          {...{
            visible,
            onCancel: () => setVisible && setVisible(false),
            payload,
            onSuccess: () => {
              if (onSuccess) onSuccess();
              setVisible && setVisible(false);
            }
          }}
        />
      )}
      {visible && target === 1 && (
        <WindEdit
          {...{
            visible,
            onCancel: () => setVisible && setVisible(false),
            payload,
            onSuccess: () => {
              if (onSuccess) onSuccess();
              setVisible && setVisible(false);
            }
          }}
        />
      )}
      {visible && target === 2 && (
        <AssetEdit
          {...{
            visible,
            onCancel: () => setVisible && setVisible(false),
            payload,
            onSuccess: () => {
              if (onSuccess) onSuccess();
              setVisible && setVisible(false);
            }
          }}
        />
      )}
      {visible && target === 3 && (
        <MeasurementEdit
          {...{
            visible,
            onCancel: () => setVisible && setVisible(false),
            payload,
            onSuccess: () => {
              if (onSuccess) onSuccess();
              setVisible && setVisible(false);
            }
          }}
        />
      )}
      {visible && target === 4 && (
        <ChildAddition
          {...{
            visible,
            onCancel: () => setVisible && setVisible(false),
            payload,
            onSuccess: () => {
              if (onSuccess) onSuccess();
              setVisible && setVisible(false);
            }
          }}
        />
      )}
      {visible && target === 5 && (
        <MeasurementBatchAddition
          {...{
            visible,
            onCancel: () => setVisible && setVisible(false),
            payload,
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
