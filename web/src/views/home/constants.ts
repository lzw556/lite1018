export const AssetTypes: Record<
  'WindTurbind' | 'Flange',
  {
    type: number;
    label: string;
    parent_id?: number;
    url: string;
  }
> = {
  WindTurbind: {
    type: 2,
    label: '风机',
    parent_id: 0,
    url: '/project-overview?locale=project-overview/windturbine'
  },
  Flange: { type: 3, label: '法兰', url: '/project-overview?locale=project-overview/flange' }
};

export const MeasurementTypes: Record<
  'loosening_angle' | 'preload' | 'dynamicPreload',
  {
    type: number
    label: string
    url: string
    firstClassProperties: string[]
  }
> = {
  loosening_angle: {
    type: 10001,
    label: '松动角度',
    url: '/project-overview?locale=project-overview/bolt',
    firstClassProperties: ['loosening_angle', 'attitude', 'motion']
  },
  preload: {
    type: 10101,
    label: '预紧力',
    url: '/project-overview?locale=project-overview/bolt',
    firstClassProperties: ['preload', 'temperature', 'pressure']
  },
  dynamicPreload: {
    type: 10102,
    label: '动态预紧力',
    url: '/project-overview?locale=project-overview/bolt',
    firstClassProperties: ['preload', 'temperature', 'pressure']
  }
}