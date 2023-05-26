import { ArrowRightOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Dropdown, Popconfirm } from 'antd';
import React from 'react';
import HasPermission from '../../../permission';
import { Permission } from '../../../permission/permission';
import intl from 'react-intl-universal';
import {
  deleteMeasurement,
  getMeasurement,
  MONITORING_POINT,
  pickId
} from '../../monitoring-point';
import { deleteAsset, getAsset } from '../services';
import { AssertAssetCategory, AssertOfAssetCategory } from '../types';
import { useAssetCategoryChain } from '../../../config/assetCategory.config';
import { useLocation } from 'react-router-dom';
import { getPathFromType, useAppConfigContext } from '../components';
import { SelfLink } from '../../../components/selfLink';

export const NodeActions = ({
  id,
  type,
  name,
  onSuccess,
  rootId,
  actionStatus
}: {
  id: number;
  type: number;
  name: string;
  onSuccess?: () => void;
  rootId?: number;
  actionStatus: any;
}) => {
  const { state } = useLocation();
  const {
    onAssetCreate,
    onAssetUpdate,
    onFlangeCreate,
    onFlangeUpdate,
    onMonitoringPointCreate,
    onMonitoringPointUpdate,
    onAreaAssetCreate,
    onAreaAssetUpdate,
    onTowerCreate,
    onTowerUpdate
  } = actionStatus;
  const isNodeAsset = AssertAssetCategory(type, AssertOfAssetCategory.IS_ASSET);
  const isNodeWind = AssertAssetCategory(type, AssertOfAssetCategory.IS_WIND_LIKE);
  const isNodeFlange = AssertAssetCategory(type, AssertOfAssetCategory.IS_FLANGE);
  const isNodeArea = AssertAssetCategory(type, AssertOfAssetCategory.IS_AREA);
  const isNodePipe = AssertAssetCategory(type, AssertOfAssetCategory.IS_PIPE);
  const isNodeRootAsset = rootId === id && isNodeAsset;
  const isNodeTower = AssertAssetCategory(type, AssertOfAssetCategory.IS_TOWER);
  return (
    <div style={{ height: 24, lineHeight: '24px' }}>
      <HasPermission value={Permission.AssetAdd}>
        <Button type='text' size='small'>
          <EditOutlined
            onClick={() => {
              if (isNodeAsset) {
                getAsset(id)
                  .then((asset) => {
                    if (isNodeFlange) {
                      onFlangeUpdate?.(asset);
                    } else if (isNodeTower) {
                      onTowerUpdate?.(asset);
                    } else if (isNodePipe) {
                      onAreaAssetUpdate?.(asset);
                    } else {
                      onAssetUpdate?.(asset);
                    }
                  })
                  .catch(() => {
                    onSuccess?.();
                  });
              } else {
                getMeasurement(id)
                  .then((point) => {
                    onMonitoringPointUpdate?.(point);
                  })
                  .catch(() => {
                    onSuccess?.();
                  });
              }
            }}
          />
        </Button>
        {!isNodeRootAsset && (
          <HasPermission value={Permission.AssetDelete}>
            <Popconfirm
              title={intl.get('DELETE_SOMETHING_PROMPT', { something: name })}
              onConfirm={() => {
                if (isNodeAsset) {
                  deleteAsset(id).then(() => {
                    onSuccess?.();
                  });
                } else {
                  deleteMeasurement(id).then(() => {
                    onSuccess?.();
                  });
                }
              }}
            >
              <Button type='text' danger={true} size='small' title={name}>
                <DeleteOutlined />
              </Button>
            </Popconfirm>
          </HasPermission>
        )}
        {isNodeAsset && (
          <AddAction
            type={type}
            onClick={(e) => {
              getAsset(id)
                .then((asset) => {
                  if (isNodeWind) {
                    if (e.key === 'tower-create') {
                      onTowerCreate?.(asset.id);
                    } else {
                      onFlangeCreate?.(asset.id);
                    }
                  } else if (
                    isNodeFlange ||
                    e.key === 'monitoring-point-create' ||
                    isNodePipe ||
                    isNodeTower
                  ) {
                    onMonitoringPointCreate?.(asset);
                  } else if (e.key === 'general-create') {
                    onAssetCreate?.(asset.id);
                  } else if (isNodeArea) {
                    onAreaAssetCreate?.(asset.id);
                  }
                })
                .catch(() => onSuccess?.());
            }}
          />
        )}
      </HasPermission>
      {!isNodeRootAsset && (
        <SelfLink to={`${getPathFromType(type)}${pickId(id)}`} state={state}>
          <Button type='text' size='small'>
            <ArrowRightOutlined />
          </Button>
        </SelfLink>
      )}
    </div>
  );
};

function AddAction({ type, onClick }: { type: number; onClick: (handler: any) => void }) {
  const config = useAppConfigContext();
  const { isLeaf, isChild } = useAssetCategoryChain();
  const isNodeWind = AssertAssetCategory(type, AssertOfAssetCategory.IS_WIND_LIKE);
  const isNodeLeaf = isLeaf(type);
  const isNodeChild = isChild(type);
  if (isNodeLeaf && isNodeChild) {
    return (
      <Dropdown
        menu={{
          items: [
            { key: 'general-create', label: intl.get('ASSET') },
            { key: 'monitoring-point-create', label: intl.get(MONITORING_POINT) }
          ],
          onClick
        }}
      >
        <Button type='text' size='small'>
          <PlusOutlined />
        </Button>
      </Dropdown>
    );
  } else if (isNodeWind && config === 'windTurbinePro') {
    return (
      <Dropdown
        menu={{
          items: [
            { key: 'flange-create', label: intl.get('FLANGE') },
            { key: 'tower-create', label: intl.get('TOWER') }
          ],
          onClick
        }}
      >
        <Button type='text' size='small'>
          <PlusOutlined />
        </Button>
      </Dropdown>
    );
  } else {
    return (
      <Button type='text' size='small'>
        <PlusOutlined onClick={onClick} />
      </Button>
    );
  }
}
