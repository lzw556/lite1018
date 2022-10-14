export const category: typeof window.assetCategory = 'wind';

export enum DeviceType {
  Gateway = 1,
  Router = 257,
  BoltLoosening = 131073,
  BoltElongation = 196609
}

export const sensors = [DeviceType.BoltLoosening, DeviceType.BoltElongation];

export const site = {
  name: '风力发电螺栓监测系统'
  //configure logo in 'views\home\summary\windTurbine\icon.tsx'
};

export const topAsset= {
  name: '风机'
  // configure icon in 'views\home\summary\windTurbine\icon.tsx'
  // dot apply css but set the size of SVG
  // thin: 28*28
  // fat: 24*24
};
