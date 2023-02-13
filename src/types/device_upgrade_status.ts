export enum DeviceUpgradeStatus {
  Invalid,
  Pending,
  Loading,
  Upgrading,
  Cancelled,
  Error,
  Success
}

export const IsUpgrading = (status: DeviceUpgradeStatus) => {
  return status >= DeviceUpgradeStatus.Pending && status <= DeviceUpgradeStatus.Upgrading;
};
