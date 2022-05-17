export const AssetTypes: Record<
  'WindTurbind' | 'Flange',
  {
    type: number;
    label: string;
    parent_id?: number;
  }
> = { WindTurbind: { type: 2, label: '风机', parent_id: 0 }, Flange: { type: 3, label: '法兰' } };

export const MeasurementTypes: Record<
  'loosening_angle' | 'preload' | 'dynamicPreload',
  {
    type: number;
    label: string;
  }
> = {
  loosening_angle: { type: 10001, label: '松动角度' },
  preload: { type: 10101, label: '预紧力' },
  dynamicPreload: { type: 10102, label: '动态预紧力' }
};
