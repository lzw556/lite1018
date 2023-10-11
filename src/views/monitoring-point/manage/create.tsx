import { Form, ModalProps } from 'antd';
import * as React from 'react';
import { Device } from '../../../types/device';
import { AssetRow } from '../../asset';
import { addMonitoringPoints } from '../services';
import { MonitoringPointInfo } from './DeviceSelection';
import { MonitoringPointFormItem } from './monitoringPointFormItem';
import { SelectParentFormItem } from './selectParentFormItem';
import intl from 'react-intl-universal';
import { MONITORING_POINT } from '../types';
import { buildRequestAttrs, getProcessId } from '../utils';
import { ModalWrapper } from '../../../components/modalWrapper';

export type MonitoringPointBatch = {
  asset_id: number;
  type: number;
  monitoring_points: (MonitoringPointInfo & {
    type: number;
  })[];
};

export const MonitoringPointCreate: React.FC<
  ModalProps & { parent?: AssetRow; onSuccess: () => void }
> = (props) => {
  const { parent, onSuccess } = props;
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
    <ModalWrapper
      {...{
        title: intl.get('CREATE_SOMETHING', { something: intl.get(MONITORING_POINT) }),
        okText: intl.get('CREATE'),
        ...props,
        width: 500,
        onOk: () => {
          form.validateFields().then((values) => {
            try {
              addMonitoringPoints({
                monitoring_points: values.monitoring_points.map(
                  ({ dev_id, name, channel, attributes }) => {
                    const process_id = getProcessId({
                      monitoringPointType: values.type,
                      isChannel: !!channel
                    });
                    if (channel !== undefined) {
                      return {
                        name,
                        type: values.type,
                        attributes: buildRequestAttrs(attributes),
                        device_binding: {
                          device_id: dev_id,
                          process_id,
                          parameters: { channel }
                        },
                        asset_id: values.asset_id
                      };
                    } else {
                      return {
                        name,
                        type: values.type,
                        attributes: buildRequestAttrs(attributes),
                        device_binding: { device_id: dev_id, process_id },
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
      <Form form={form} layout='vertical'>
        <SelectParentFormItem
          parent={parent}
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
          key={parent?.id}
        />
        <MonitoringPointFormItem
          selectedPointType={selectedPointType}
          devices={devices}
          onSelect={setSelectPoints}
          onRemove={(index) => setSelectPoints((prev) => prev.filter((p, i) => index !== i))}
          initialSelected={selectedPoints}
        />
      </Form>
    </ModalWrapper>
  );
};

function getPointName(name: string, channel?: number) {
  return `${name}${channel ? `-${intl.get('CHANNEL')}${channel}` : ''}`;
}
