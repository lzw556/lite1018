import { Form, Modal, ModalProps } from 'antd';
import * as React from 'react';
import { defaultValidateMessages } from '../../../constants/validator';
import { Device } from '../../../types/device';
import { AssetRow } from '../../asset';
import { addMonitoringPoints } from '../services';
import { CREATE_MONITORING_POINT } from '../types';
import { MonitoringPointInfo } from './DeviceSelection';
import { MonitoringPointFormItem } from './monitoringPointFormItem';
import { SelectFlangeFormItem } from './selectFlangeFormItem';

export type MonitoringPointBatch = {
  asset_id: number;
  type: number;
  monitoring_points: (MonitoringPointInfo & {
    type: number;
  })[];
};

export const MonitoringPointCreate: React.FC<
  ModalProps & { flanges?: AssetRow[]; flange?: AssetRow; onSuccess: () => void }
> = (props) => {
  const { flanges = [], flange, onSuccess } = props;
  const [form] = Form.useForm<MonitoringPointBatch>();
  const [selectedPointType, setSelectedPointType] = React.useState<number | undefined>();
  const [devices, setDevices] = React.useState<Device[]>([]);
  const [selectedPoints, setSelectPoints] = React.useState<MonitoringPointInfo[]>([]);

  React.useEffect(() => {
    const mergeInputs = () => {
      const inputs = form.getFieldsValue();
      const points: MonitoringPointInfo[] = inputs.monitoring_points;
      let values: MonitoringPointInfo[] = selectedPoints.map((point) => ({
        ...point,
        name: getPointName(point.dev_name, point.channel)
      }));
      if (points && points.length > 0) {
        values = selectedPoints.map(({ dev_id, dev_name, channel }, index) => {
          const point = points.find(
            (item) => dev_id === item.dev_id && (item.channel ?? 0) === channel
          );
          if (point) {
            return point;
          } else {
            return { ...selectedPoints[index], name: getPointName(dev_name, channel) };
          }
        });
      }
      form.setFieldsValue({
        monitoring_points: values
      });
    };
    mergeInputs();
  }, [form, selectedPoints]);

  return (
    <Modal
      {...{
        title: CREATE_MONITORING_POINT,
        cancelText: '取消',
        okText: '添加',
        ...props,
        width: 600,
        onOk: () => {
          form.validateFields().then((values) => {
            try {
              addMonitoringPoints({
                monitoring_points: values.monitoring_points.map(
                  ({ dev_id, place, name, channel }) => {
                    if (channel !== undefined) {
                      return {
                        name,
                        type: values.type,
                        attributes: { index: Number(place) },
                        device_binding: {
                          device_id: dev_id,
                          process_id: 2,
                          parameters: { channel }
                        },
                        asset_id: values.asset_id
                      };
                    } else {
                      return {
                        name,
                        type: values.type,
                        attributes: { index: Number(place) },
                        device_binding: { device_id: dev_id },
                        asset_id: values.asset_id
                      };
                    }
                  }
                )
              }).then(() => {
                onSuccess();
              });
            } catch (error) {
              console.log(error);
            }
          });
        }
      }}
    >
      <Form form={form} labelCol={{ span: 6 }} validateMessages={defaultValidateMessages}>
        <SelectFlangeFormItem
          flanges={flanges}
          flange={flange}
          onSelect={(type: number, devices: Device[]) => {
            if (type !== selectedPointType) {
              form.setFieldsValue({
                monitoring_points: []
              });
              setSelectedPointType(type);
              setDevices(devices);
            }
          }}
          form={form}
        />
        <MonitoringPointFormItem
          key={selectedPointType}
          devices={devices}
          onSelect={setSelectPoints}
          onRemove={(index) => setSelectPoints((prev) => prev.filter((p, i) => index !== i))}
          initialSelected={selectedPoints}
        />
      </Form>
    </Modal>
  );
};

function getPointName(name: string, channel?: number) {
  return `${name}${channel ? `-通道${channel}` : ''}`;
}
