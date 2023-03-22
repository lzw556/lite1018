import { Button, Checkbox, Col, Row, Space } from 'antd';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import * as React from 'react';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { DeviceType } from '../../../types/device_type';
import { Device } from '../../../types/device';
import intl from 'react-intl-universal';

export type MonitoringPointInfo = {
  place: string;
  name: string;
  dev_id: number;
  dev_name: string;
  dev_type: number;
  channel?: number;
};

export const DeviceSelection: React.FC<{
  devices: Device[];
  onSelect: (selected: MonitoringPointInfo[]) => void;
  initialSelected?: MonitoringPointInfo[];
}> = (props) => {
  const [selected, setSelected] = React.useState<[number, number[]][]>(
    parseInitialPoints(props.initialSelected)
  );
  const [selectedPoints, setSelectedPoints] = React.useState<MonitoringPointInfo[]>([]);

  React.useEffect(() => {
    const points: MonitoringPointInfo[] = [];
    if (props.devices !== undefined && props.devices.length > 0) {
      selected.forEach((item) => {
        const deviceId = item[0];
        const device = props.devices?.find((dev) => dev.id === deviceId);
        if (device) {
          const channels = item[1];
          const point: MonitoringPointInfo = {
            dev_id: deviceId,
            dev_name: device ? device.name : deviceId.toString(),
            place: '',
            name: '',
            dev_type: device ? device.typeId : 0
          };
          if (channels.length > 0) {
            channels.forEach((num) =>
              points.push({
                ...point,
                channel: num
              })
            );
          } else {
            points.push(point);
          }
        }
      });
    }
    setSelectedPoints(points);
  }, [selected, props.devices]);

  return (
    <>
      <div style={{ overflow: 'auto', maxHeight: 300 }}>
        <Checkbox.Group value={selected.map((item) => item[0])}>
          <Row>
            {props.devices?.map(({ id, name, macAddress, typeId }) => {
              const defaultCheckedList =
                selected.filter((item) => item[0] === id).length > 0
                  ? selected.filter((item) => item[0] === id)[0][1]
                  : [];
              const defaultIndeterminate =
                defaultCheckedList.length > 0 && defaultCheckedList.length < 4;
              return (
                <Col
                  span={typeId === DeviceType.BoltElongationMultiChannels ? 24 : 12}
                  key={macAddress}
                >
                  {typeId === DeviceType.BoltElongationMultiChannels ? (
                    <div style={{ marginBottom: 10 }}>
                      <CheckAll
                        all={{ label: name, value: id, indeterminate: defaultIndeterminate }}
                        checkAllChange={(checkValues) => {
                          setSelected((prev) => {
                            const crt = prev.filter((item) => item[0] === id);
                            if (crt.length > 0 && checkValues.length > 0) {
                              return prev.map((item) => {
                                if (item[0] === id) {
                                  return [item[0], checkValues as number[]];
                                } else {
                                  return item;
                                }
                              });
                            } else if (checkValues.length === 0) {
                              return prev.filter((item) => item[0] !== id);
                            } else {
                              return [...prev, [id, checkValues as number[]]];
                            }
                          });
                        }}
                        defaultCheckedList={defaultCheckedList}
                        options={[
                          { label: `${intl.get('CHANNEL')}1`, value: 1 },
                          { label: `${intl.get('CHANNEL')}2`, value: 2 },
                          { label: `${intl.get('CHANNEL')}3`, value: 3 },
                          { label: `${intl.get('CHANNEL')}4`, value: 4 }
                        ]}
                      />
                    </div>
                  ) : (
                    <Checkbox
                      value={id}
                      style={{ height: 30 }}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelected((prev) => [...prev, [id, []]]);
                        } else {
                          setSelected((prev) => prev.filter((item) => item[0] !== id));
                        }
                      }}
                    >
                      {name}
                    </Checkbox>
                  )}
                </Col>
              );
            })}
          </Row>
        </Checkbox.Group>
      </div>
      <div style={{ marginTop: 10 }}>
        <Button
          type='primary'
          onClick={() => {
            props.onSelect(selectedPoints);
          }}
        >
          {intl.get('OK')}
        </Button>
      </div>
    </>
  );
};

function parseInitialPoints(initial?: MonitoringPointInfo[]): [number, number[]][] {
  if (initial === undefined) return [];
  const deviceIds: number[] = [];
  initial.forEach(({ dev_id }) => {
    if (!deviceIds.includes(dev_id)) deviceIds.push(dev_id);
  });
  return deviceIds.map((id) => {
    return [id, initial.filter(({ dev_id }) => dev_id === id).map(({ channel = 0 }) => channel)];
  });
}

function CheckAll({
  all,
  defaultCheckedList = [],
  options,
  checkAllChange
}: {
  all: { label: string; value: number; indeterminate: boolean };
  defaultCheckedList?: CheckboxValueType[];
  options: { label: string; value: number }[];
  checkAllChange: (checkValues: CheckboxValueType[]) => void;
}) {
  const [checkedList, setCheckedList] = React.useState<CheckboxValueType[]>(defaultCheckedList);
  const [indeterminate, setIndeterminate] = React.useState(all.indeterminate ?? false);

  const onChange = (list: CheckboxValueType[]) => {
    setCheckedList(list);
    setIndeterminate(!!list.length && list.length < options.length);
    checkAllChange(list);
  };

  const onCheckAllChange = (e: CheckboxChangeEvent) => {
    const checkList = e.target.checked ? options.map(({ value }) => value) : [];
    setCheckedList(checkList);
    setIndeterminate(false);
    checkAllChange(checkList);
  };

  return (
    <Space direction='vertical'>
      <Checkbox indeterminate={indeterminate} onChange={onCheckAllChange} value={all.value}>
        {all.label}
      </Checkbox>
      <Checkbox.Group
        options={options}
        value={checkedList}
        onChange={onChange}
        style={{ marginLeft: 30 }}
      />
    </Space>
  );
}
