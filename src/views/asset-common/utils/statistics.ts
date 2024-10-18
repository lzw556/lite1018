import { ColorOffline } from '../../../constants/color';
import { AlarmState, getAlarmLevelColor, getAlarmStateText } from '../../../types/alarm';

export type AssetChildrenStatistics = {
  alarmNum: [number, number, number] | null;
  assetId: number;
  deviceNum: number;
  monitoringPointNum: number;
  offlineDeviceNum: number;
};
export type NameValue = { name: string; value: string | number; className?: string };
export type AlarmStatistics = Map<AlarmState, NameValue>;
export type Visible =
  | (keyof AssetChildrenStatistics | AlarmState)
  | [keyof AssetChildrenStatistics | AlarmState, string];

export function resolveStatistics(statis: AssetChildrenStatistics, ...visibles: Visible[]) {
  const { alarmNum, monitoringPointNum } = statis;
  const alarmState = getAlarmStateOfAsset(alarmNum);
  const childrenStatis = mapAssetStatistics(statis);
  const alarmStatis = calculateAlarmStatis(monitoringPointNum, alarmNum);
  const alarmStatisWithName = mapAlarmStatistics(alarmStatis);
  return tranformVM_AssetStatistics(childrenStatis, alarmState, alarmStatisWithName, ...visibles);
}

function tranformVM_AssetStatistics(
  childrenStatis: Map<keyof AssetChildrenStatistics, NameValue>,
  alarmState: AlarmState,
  alarmStatisWithName: Map<AlarmState, NameValue>,
  ...visibles: Visible[]
) {
  const groups: (NameValue & { color: string })[] = [];
  visibles.forEach((visible) => {
    let name = '';
    let value: string | number = '';
    let key = visible;
    if (typeof visible === 'object') {
      key = visible[0];
      name = visible[1];
    }
    const assetStatis = childrenStatis.get(key as keyof AssetChildrenStatistics);
    const alarmStatis = alarmStatisWithName.get(key as AlarmState);
    let className = key === 'offlineDeviceNum' ? 'offline' : undefined; // hardcode
    let color = ColorOffline;
    if (assetStatis) {
      value = assetStatis.value;
      if (!name) name = assetStatis.name;
    } else if (alarmStatis) {
      value = alarmStatis.value;
      if (!name) name = alarmStatis.name;
      className = key as AlarmState;
      color = getAlarmLevelColor(key as AlarmState);
    }
    groups.push({ name, value, className, color });
  });
  return { statistics: groups, alarmState };
}

function getAlarmStateOfAsset(alarmNum: AssetChildrenStatistics['alarmNum']) {
  let state: AlarmState = 'normal';
  if (!alarmNum || alarmNum.length < 3) return state;
  if (alarmNum[0]) state = 'info';
  if (alarmNum[1]) state = 'warn';
  if (alarmNum[2]) state = 'danger';
  return state;
}

function calculateAlarmStatis(
  total: number,
  alarmNum: AssetChildrenStatistics['alarmNum'],
  ...excludedStates: AlarmState[]
): Map<AlarmState, number> {
  const statis = new Map<AlarmState, number>();
  statis.set('normal', total);
  statis.set('info', 0);
  statis.set('warn', 0);
  statis.set('danger', 0);
  statis.set('anomalous', 0);
  if (alarmNum && alarmNum.length === 3) {
    statis.set('info', alarmNum[0]);
    statis.set('warn', alarmNum[1]);
    statis.set('danger', alarmNum[2]);
    statis.set('anomalous', alarmNum[0] + alarmNum[1] + alarmNum[2]);
    statis.set('normal', total - alarmNum[0] - alarmNum[1] - alarmNum[2]);
  }
  if (excludedStates && excludedStates.length > 0) {
    return new Map(
      Array.from(statis).filter(
        ([alarmState]) => !excludedStates.find((state) => state === alarmState)
      )
    );
  }
  return statis;
}

function mapAssetStatistics(statis: AssetChildrenStatistics) {
  const final = new Map<keyof AssetChildrenStatistics, NameValue>();
  let key: keyof AssetChildrenStatistics;
  for (key in statis) {
    if (key === 'alarmNum') continue;
    final.set(key, { name: mapAssetStatisticsProperty(key), value: statis[key] });
  }
  return final;
}

function mapAssetStatisticsProperty(propertyName: keyof AssetChildrenStatistics) {
  switch (propertyName) {
    case 'deviceNum':
      return 'DEVICE';
    case 'monitoringPointNum':
      return 'MONITORING_POINT';
    case 'offlineDeviceNum':
      return 'OFFLINE_DEVICE';
    default:
      return propertyName;
  }
}

function mapAlarmStatistics(statis: Map<AlarmState, number>) {
  const res = new Map<AlarmState, NameValue>();
  for (const [key, value] of statis) {
    res.set(key, { name: getAlarmStateText(key), value });
  }
  return res;
}

export function generateProjectAlarmStatis(total: number, alarmNum: [number, number, number]) {
  return Array.from(mapAlarmStatistics(calculateAlarmStatis(total, alarmNum, 'anomalous'))).map(
    ([alarmState, nameValue]) => {
      return {
        name: nameValue.name,
        value: nameValue.value,
        itemStyle: { color: getAlarmLevelColor(alarmState) }
      };
    }
  );
}
