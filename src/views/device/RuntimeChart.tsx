import * as React from 'react';
import { Card, Empty } from 'antd';
import dayjs from '../../utils/dayjsUtils';
import { GetDeviceRuntimeRequest } from '../../apis/device';
import { isMobile } from '../../utils/deviceDetection';
import { DeviceType } from '../../types/device_type';
import intl from 'react-intl-universal';
import { PropertyChart } from '../../components/charts/propertyChart';

export const RuntimeChart: React.FC<{ deviceId: number; deviceType: number }> = ({
  deviceId,
  deviceType
}) => {
  const [runtimes, setRuntimes] = React.useState<
    {
      batteryVoltage: number;
      signalStrength: number;
      timestamp: number;
    }[]
  >([]);

  React.useEffect(() => {
    GetDeviceRuntimeRequest(
      deviceId,
      dayjs().startOf('day').subtract(13, 'd').utc().unix(),
      dayjs().endOf('day').utc().unix()
    ).then(setRuntimes);
  }, [deviceId, deviceType]);

  if (runtimes.length) {
    const xAxisValues = runtimes.map((item) =>
      dayjs.unix(item.timestamp).local().format('YYYY-MM-DD HH:mm:ss')
    );
    return (
      <Card bordered={false}>
        {!DeviceType.isWiredDevice(deviceType) && (
          <Card.Grid
            style={{ boxShadow: 'none', border: 'none', width: isMobile ? '100%' : '50%' }}
          >
            <PropertyChart
              rawOptions={{ title: { text: intl.formatMessage({ id: 'BATTERY_VOLTAGE' }) } }}
              series={[
                {
                  data: {
                    [intl.formatMessage({ id: 'BATTERY_VOLTAGE' })]: runtimes.map(
                      (item) => item.batteryVoltage
                    )
                  },
                  xAxisValues
                }
              ]}
              withArea={true}
              yAxisValueMeta={{ unit: 'mV', precision: 0 }}
            />
          </Card.Grid>
        )}
        <Card.Grid style={{ boxShadow: 'none', border: 'none', width: isMobile ? '100%' : '50%' }}>
          <PropertyChart
            rawOptions={{ title: { text: intl.formatMessage({ id: 'SIGNAL_STRENGTH' }) } }}
            series={[
              {
                data: {
                  [intl.formatMessage({ id: 'SIGNAL_STRENGTH' })]: runtimes.map(
                    (item) => item.signalStrength
                  )
                },
                xAxisValues
              }
            ]}
            withArea={true}
            yAxisValueMeta={{ unit: 'dBm', precision: 0 }}
          />
        </Card.Grid>
      </Card>
    );
  }
  return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={intl.get('NO_DATA_PROMPT')} />;
};
