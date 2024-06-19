export type Report = {
  id: number;
  start: number;
  end: number;
  filename: string;
  reportName: string;
  reportDate: number;
  alarmRecords?: any;
  alarmRecordsStat?: {
    minorAlarmNum: number;
    majorAlarmNum: number;
    criticalAlarmNum: number;
    handledNum: number;
    unhandledNum: number;
  };
  assetsStat: {
    normalAlarmNum: number;
    minorAlarmNum: number;
    majorAlarmNum: number;
    criticalAlarmNum: number;
  };
  monitoringPointsStat: {
    normalAlarmNum: number;
    minorAlarmNum: number;
    majorAlarmNum: number;
    criticalAlarmNum: number;
  };
  devicesStat: { onlineNum: number; offlineNum: number };
};

export const A4_SIZE = { width: 210, height: 297, unit: 'mm', padding: 20 };
export const A4_HEIGHT = 1122.519;
export const PREFACE_PLATFORM = '博感云平台';
export const COMPANY = '嘉兴博感科技有限公司';
export const ALARM_LEVELS = ['正常', '普通', '重要', '紧急'];
export const PREFACES = [
  `本评估报告由${PREFACE_PLATFORM}自动生成，版权归${COMPANY}所有；`,
  `委托方负有对监测报告保密的义务，未经受托方书面许可不得将本报告提供给第三方、印刷成其它宣传材料或发布于网络等公共信息平台；`,
  `本报告为${PREFACE_PLATFORM}对机组的分析和诊断、维护建议，仅供参考，具体维护维修措施还需要委托方自行决定；`,
  `本报告不作为任何理赔，诉讼等证明材料；`
];
export const PAGE_GAP = 15;
