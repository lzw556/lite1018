import * as React from 'react';
import { Col, Empty, Row } from 'antd';
import intl from 'react-intl-universal';
import dayjs from '../../utils/dayjsUtils';
import { GetDeviceRuntimeRequest } from '../../apis/device';
import { DeviceType } from '../../types/device_type';
import { PropertyChart } from '../../components/charts/propertyChart';
import { Card } from '../../components';
import { generateColProps } from '../../utils/grid';

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
        <Row>
          {!DeviceType.isWiredDevice(deviceType) && (
            <Col {...generateColProps({ lg: 12, xl: 12, xxl: 12 })}>
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
                yAxis={{ unit: 'mV', precision: 0 }}
              />
            </Col>
          )}
          <Col {...generateColProps({ lg: 12, xl: 12, xxl: 12 })}>
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
              yAxis={{ unit: 'dBm', precision: 0 }}
            />
          </Col>
        </Row>
      </Card>
    );
  }
  return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={intl.get('NO_DATA_PROMPT')} />;
};
