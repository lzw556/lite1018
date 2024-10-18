import { MONITORING_POINT } from '../../asset-common';
import { wind, flange, tower } from '../constants';

const getAssetHierarchy = () => ({
  top: wind,
  children: [flange, tower],
  leaf: { type: 99999, label: MONITORING_POINT }
});

export function useDescendentTypes(type?: number) {
  const { children, top, leaf } = getAssetHierarchy();
  if (!type) {
    return [top, ...children, leaf];
  }
  if (type === top.type) {
    return [...children, leaf];
  } else {
    return [leaf];
  }
}

export function useParentTypes(type?: number) {
  const { children, top } = getAssetHierarchy();
  if (!type) {
    return children;
  }
  if (children.map(({ type }) => type).includes(type)) {
    return [top];
  } else {
    return [];
  }
}
