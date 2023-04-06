import { Space } from 'antd';
import * as React from 'react';
import { FlangeCreate, FlangeUpdate } from '../../flange';
import { MonitoringPointCreate, MonitoringPointUpdate } from '../../monitoring-point';
import { CreateAreaAsset } from '../area-asset/create';
import { UpdateAreaAsset } from '../area-asset/update';
import { CreateAsset } from '../manage/create';
import { UpdateAsset } from '../manage/update';

export enum AssetAction {
  ASSET_CREATE,
  ASSET_UPDATE,
  FLANGE_CREATE,
  FLANGE_UPDATE,
  MONITORING_POINT_CREATE,
  MONITORING_POINT_UPDATE,
  AREA_ASSET_CREATE,
  AREA_ASSET_UPDATE
}

export const ActionBar: React.FC<{
  hasPermission: boolean;
  actions: React.ReactNode[];
  open?: boolean;
  setVisible?: React.Dispatch<React.SetStateAction<boolean>>;
  action: { type: AssetAction; payload?: any };
  onSuccess?: () => void;
  style?: React.CSSProperties;
}> = (props) => {
  const {
    hasPermission,
    actions,
    open,
    setVisible,
    action: { type, payload },
    onSuccess
  } = props;

  return (
    <Space wrap={true} style={props.style}>
      {hasPermission && actions}
      {open && type === AssetAction.ASSET_CREATE && (
        <CreateAsset
          {...{
            open,
            onCancel: () => setVisible && setVisible(false),
            ...payload,
            onSuccess: () => {
              if (onSuccess) onSuccess();
              setVisible && setVisible(false);
            }
          }}
        />
      )}
      {open && type === AssetAction.ASSET_UPDATE && (
        <UpdateAsset
          {...{
            open,
            onCancel: () => setVisible && setVisible(false),
            ...payload,
            onSuccess: () => {
              if (onSuccess) onSuccess();
              setVisible && setVisible(false);
            }
          }}
        />
      )}
      {open && type === AssetAction.FLANGE_CREATE && (
        <FlangeCreate
          {...{
            open,
            onCancel: () => setVisible && setVisible(false),
            ...payload,
            onSuccess: () => {
              if (onSuccess) onSuccess();
              setVisible && setVisible(false);
            }
          }}
        />
      )}
      {open && type === AssetAction.FLANGE_UPDATE && (
        <FlangeUpdate
          {...{
            open,
            onCancel: () => setVisible && setVisible(false),
            ...payload,
            onSuccess: () => {
              if (onSuccess) onSuccess();
              setVisible && setVisible(false);
            }
          }}
        />
      )}
      {open && type === AssetAction.MONITORING_POINT_CREATE && (
        <MonitoringPointCreate
          {...{
            open,
            onCancel: () => setVisible && setVisible(false),
            ...payload,
            onSuccess: () => {
              if (onSuccess) onSuccess();
              setVisible && setVisible(false);
            }
          }}
        />
      )}
      {open && type === AssetAction.MONITORING_POINT_UPDATE && (
        <MonitoringPointUpdate
          {...{
            open,
            onCancel: () => setVisible && setVisible(false),
            ...payload,
            onSuccess: () => {
              if (onSuccess) onSuccess();
              setVisible && setVisible(false);
            }
          }}
        />
      )}
      {open && type === AssetAction.AREA_ASSET_CREATE && (
        <CreateAreaAsset
          {...{
            open,
            onCancel: () => setVisible && setVisible(false),
            ...payload,
            onSuccess: () => {
              if (onSuccess) onSuccess();
              setVisible && setVisible(false);
            }
          }}
        />
      )}
      {open && type === AssetAction.AREA_ASSET_UPDATE && (
        <UpdateAreaAsset
          {...{
            open,
            onCancel: () => setVisible && setVisible(false),
            ...payload,
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
