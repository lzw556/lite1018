import * as React from 'react';
import { Button, Checkbox, Col, Row, Space } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import intl from 'react-intl-universal';
import { DeviceType } from '../../../types/device_type';
import { Device } from '../../../types/device';
import { MonitoringPointInfo } from './types';

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
        <Checkbox.Group style={{ width: '100%' }} value={selected.map((item) => item[0])}>
          <Row style={{ width: '100%' }}>
            {props.devices?.map(({ id, name, macAddress, typeId }) => {
              const channels = DeviceType.isMultiChannel(typeId, true);
              const defaultCheckedList =
                selected.filter((item) => item[0] === id).length > 0
                  ? selected.filter((item) => item[0] === id)[0][1]
                  : [];
              return (
                <Col span={channels.length > 0 ? 24 : 12} key={macAddress}>
                  {channels.length > 0 ? (
                    <div style={{ marginBottom: 12 }}>
                      <CheckAll
                        all={{ label: name, value: id }}
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
                        options={channels.map((c) => ({
                          ...c,
                          label: `${intl.get('CHANNEL')}${c.value}`
                        }))}
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
      <div style={{ marginTop: 12 }}>
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
  all: { label: string; value: number };
  defaultCheckedList?: number[];
  options: { label: string; value: number }[];
  checkAllChange: (checkValues: number[]) => void;
}) {
  const [checkedList, setCheckedList] = React.useState<number[]>(defaultCheckedList);

  const onChange = (list: number[]) => {
    setCheckedList(list);
    checkAllChange(list);
  };

  const onCheckAllChange = (e: CheckboxChangeEvent) => {
    const checkList = e.target.checked ? options.map(({ value }) => value) : [];
    setCheckedList(checkList);
    checkAllChange(checkList);
  };

  return (
    <Space direction='vertical'>
      <Checkbox onChange={onCheckAllChange} value={all.value}>
        {all.label}
      </Checkbox>
      <Checkbox.Group
        options={options}
        value={checkedList}
        onChange={onChange}
        style={{ marginLeft: 30, whiteSpace: 'nowrap' }}
      />
    </Space>
  );
}
