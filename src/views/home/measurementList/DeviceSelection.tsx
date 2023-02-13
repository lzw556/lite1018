import { Button, Checkbox, Col, Row } from 'antd';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import * as React from 'react';
import { GetDevicesRequest } from '../../../apis/device';
import { Device } from '../../../types/device';
import * as AppConfig from '../../../config';

export type MeasurementInfo = {
  place: string;
  name: string;
  dev_id: number;
  dev_name: string;
  dev_type: number;
  channel?: number;
};

export const DeviceSelection: React.FC<{
  onSelect: (selected: MeasurementInfo[]) => void;
  initialSelected?: MeasurementInfo[];
}> = (props) => {
  const [devices, setDevices] = React.useState<Device[]>();
  const [selected, setSelected] = React.useState<MeasurementInfo[]>(props.initialSelected || []);

  React.useEffect(() => {
    const configWind = AppConfig.use('wind');
    GetDevicesRequest({ types: configWind.sensorTypes.toString() }).then(setDevices);
  }, []);

  return (
    <>
      <div style={{ overflow: 'auto', maxHeight: 300 }}>
        <Checkbox.Group
          onChange={(checkedValues: CheckboxValueType[]) => {
            setSelected(
              (checkedValues as number[]).map((id) => {
                const device = devices?.find((dev) => dev.id === id);
                return {
                  dev_id: id,
                  dev_name: device ? device.name : id.toString(),
                  place: '',
                  name: '',
                  dev_type: device ? device.typeId : 0
                };
              })
            );
          }}
          value={selected.map(({ dev_id }) => dev_id)}
        >
          {devices?.map(({ id, name, macAddress }) => (
            <Row key={macAddress}>
              <Col span={24}>
                <Checkbox value={id} style={{ height: 30 }}>
                  {name}
                </Checkbox>
              </Col>
            </Row>
          ))}
        </Checkbox.Group>
      </div>
      <div style={{ marginTop: 10 }}>
        <Button
          type='primary'
          onClick={() => {
            props.onSelect(selected);
          }}
        >
          选好了
        </Button>
      </div>
    </>
  );
};
