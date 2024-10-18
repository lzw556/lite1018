import { mapTree } from '../../utils/tree';
import { AssetRow, useContext } from '../asset-common';
import { area, motor, pipe, tank } from './constants';
import { defaultSettings as MotorDefaultSettings } from './motor/settings';

export function isArea(type: number) {
  return type === area.type;
}

export function isAssetAreaParent(asset: AssetRow) {
  return asset.type === area.type && isAreaTop(asset) && !hasNonAreaChildren(asset);
}

function hasNonAreaChildren(asset: AssetRow) {
  return asset.children ? asset.children.some((c) => c.type !== area.type) : false;
}

function isAreaTop(asset: AssetRow) {
  return asset.parentId === 0;
}

export function isAssetValidParent(asset: AssetRow) {
  return asset.type === area.type && !hasAreaChildren(asset);
}

function hasAreaChildren(asset: AssetRow) {
  return asset.children ? asset.children.some((c) => c.type === area.type) : false;
}

export function useParents() {
  const { assets } = useContext();
  const parents: AssetRow[] = [];
  assets
    .filter((a) => a.type === area.type)
    .forEach((a) => {
      if (isAssetValidParent(a)) {
        parents.push(a);
      }
      if (a.children && a.children.length > 0) {
        parents.push(...a.children.filter(isAssetValidParent));
      }
    });
  return parents;
}

export function useMonitoringPointParents(
  isAssetValidParentFn2: (asset: AssetRow) => boolean,
  parent?: AssetRow
) {
  const { assets } = useContext();
  if (parent && isAssetValidParentFn2(parent)) {
    return [];
  } else {
    const parents: AssetRow[] = [];
    mapTree(
      assets.filter((a) => a.type === area.type),
      (asset) => {
        if (isAssetValidParentFn2(asset)) {
          parents.push(asset);
        }
      }
    );
    return parents;
  }
}

export function isVibrationRelated(type: number) {
  return type === motor.type;
}

export function isCorrosionRelated(type: number) {
  return type === pipe.type || type === tank.type;
}

type TypeMeta = { label: string; settings?: { default: object } } | undefined;

export function getByType(type: number): TypeMeta {
  let typeInfo: TypeMeta;
  switch (type) {
    case motor.type:
      return { label: motor.label, settings: { default: MotorDefaultSettings } };
    case pipe.type:
      return { label: pipe.label };
    case tank.type:
      return { label: tank.label };
    default:
      break;
  }
  return typeInfo;
}
