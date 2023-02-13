import { Display } from './display';

export type Asset = {
  id: number;
  name: string;
  parentId: number;
  image: string;
  display?: Display;
  status: number;
  parent?: Asset;
};

export const InitializeAssetState = {
  id: 0,
  name: ''
};
