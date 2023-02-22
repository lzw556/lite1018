import { MinusCircleOutlined } from '@ant-design/icons';
import { Button, Divider, Form, Input, Modal, ModalProps, Popover, Select } from 'antd';
import * as React from 'react';
import { defaultValidateMessages, Rules } from '../../../constants/validator';
import { AssetRow } from '../assetList/props';
import { getAssets } from '../assetList/services';
import { EditFormPayload } from '../common/useActionBarStatus';
import { addMeasurements } from '../summary/measurement/services';
import * as AppConfig from '../../../config';
import { DeviceSelection, MeasurementInfo } from './DeviceSelection';
import { DeviceType } from '../../../types/device_type';

export type MeasurementBatch = {
  asset_id: number;
  type: number;
  monitoring_points: (MeasurementInfo & {
    type: number;
  })[];
};

export const MeasurementBatchAddition: React.FC<
  ModalProps & { payload?: EditFormPayload; onSuccess: () => void }
> = (props) => {
  const { payload, onSuccess } = props;
  const asset = payload?.asset;
  const [parents, setParents] = React.useState<AssetRow[]>([]);
  const measurementTypes = AppConfig.getMeasurementTypes(window.assetCategory);
  const configWind = AppConfig.use('wind');
  const parentId = asset && asset.type !== configWind.assetType.id ? asset.id : undefined;
  const [form] = Form.useForm<MeasurementBatch>();
  const [visible, setVisible] = React.useState(false);
  const [selected, setSelected] = React.useState<MeasurementInfo[]>([]);

  React.useEffect(() => {
    const configWind = AppConfig.use('wind');
    const grandParentId = asset && asset.type === configWind.assetType.id ? asset.id : undefined;
    let type = AppConfig.use('default').assetType.id;
    if (window.assetCategory === 'wind') type = configWind.assetType.secondAsset?.id || 0;
    getAssets({ type }).then((assets) => {
      setParents(
        assets.filter((asset) => (grandParentId ? grandParentId === asset.parentId : true))
      );
    });
  }, [asset]);

  React.useEffect(() => {
    if (selected.length > 0) {
      const inputs = form.getFieldsValue();
      const points: MeasurementInfo[] = inputs.monitoring_points;
      let values: MeasurementInfo[] = selected.map(({ dev_name, dev_id, place, dev_type }) => ({
        name: dev_name,
        place,
        dev_id,
        dev_name,
        dev_type
      }));
      if (points && points.length > 0) {
        values = selected.map(({ dev_id, dev_name }, index) => {
          const point = points.find((item) => dev_id === item.dev_id);
          if (point) {
            return point;
          } else {
            return { ...selected[index], name: dev_name };
          }
        });
      }
      form.setFieldsValue({
        monitoring_points: values
      });
    }
  }, [selected, form]);

  const onNameValidator = (rule: any, value: any) => {
    return new Promise<void>((resolve, reject) => {
      if (!value || !Number.isInteger(value * 1)) {
        resolve();
        return;
      }
      const rules = form.getFieldValue('monitoring_points');
      if (rules.filter(({ place }: any) => place === value).length > 1) {
        reject('位置不能重复');
      }
      resolve();
    });
  };

  return (
    <Modal
      {...{
        title: `监测点批量添加`,
        cancelText: '取消',
        okText: '添加',
        ...props,
        onOk: () => {
          form.validateFields().then((values) => {
            try {
              addMeasurements({
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
      <Form form={form} labelCol={{ span: 4 }} validateMessages={defaultValidateMessages}>
        <Form.Item
          label='法兰'
          name='asset_id'
          rules={[{ required: true, message: `请选择法兰` }]}
          hidden={!!parentId}
          initialValue={parentId}
        >
          <Select placeholder='请选择法兰'>
            {parents.map(({ id, name }) => (
              <Select.Option key={id} value={id}>
                {name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label='类型' name='type' rules={[{ required: true, message: `请选择类型` }]}>
          <Select placeholder='请选择类型'>
            {measurementTypes
              .filter((type) => !type.hidden)
              .map(({ id, label }) => (
                <Select.Option key={id} value={id}>
                  {label}
                </Select.Option>
              ))}
          </Select>
        </Form.Item>
        <Form.List
          name='monitoring_points'
          rules={[
            {
              validator: async (_, points) => {
                if (!points || points.length <= 0) {
                  return Promise.reject(new Error('请添加监测点'));
                }
              }
            }
          ]}
        >
          {(fields, { add, remove }, { errors }) => (
            <div style={{ overflow: 'auto', maxHeight: 600 }}>
              {fields.map(({ key, name, ...restFields }, index) => (
                <div key={key} style={{ position: 'relative' }}>
                  <p style={{ textIndent: 35, color: '#8a8e99' }}>
                    {form.getFieldValue('monitoring_points')[name].dev_name}
                    <MinusCircleOutlined
                      onClick={() => {
                        remove(name);
                        setSelected((prev) => prev.filter((item, n) => n !== index));
                      }}
                    />
                  </p>
                  <Form.Item
                    label='名称'
                    {...restFields}
                    name={[name, 'name']}
                    rules={[Rules.range(4, 16)]}
                  >
                    <Input placeholder={`请填写监测点名称`} />
                  </Form.Item>
                  {form.getFieldValue('monitoring_points')[name].dev_type ===
                    DeviceType.BoltElongationMultiChannels && (
                    <Form.Item
                      label='通道号'
                      name={[name, 'channel']}
                      rules={[{ required: true, message: `请选择通道号` }]}
                      initialValue={1}
                    >
                      <Select>
                        {[
                          { label: '1', value: 1 },
                          { label: '2', value: 2 },
                          { label: '3', value: 3 },
                          { label: '4', value: 4 }
                        ].map(({ label, value }) => (
                          <Select.Option key={value} value={value}>
                            {label}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  )}
                  <Form.Item
                    label='位置'
                    {...restFields}
                    name={[name, 'place']}
                    rules={[Rules.number, { validator: onNameValidator }]}
                  >
                    <Input placeholder={`请填写监测点位置`} />
                  </Form.Item>
                  <Divider />
                </div>
              ))}
              <Form.ErrorList errors={errors} />
              <Form.Item wrapperCol={{ offset: 2 }}>
                <Popover
                  title='选择设备'
                  content={
                    visible && (
                      <DeviceSelection
                        onSelect={(selecteds) => {
                          setVisible(false);
                          setSelected(selecteds);
                        }}
                        initialSelected={selected}
                      />
                    )
                  }
                  trigger={['click']}
                  placement='rightTop'
                  visible={visible}
                  onVisibleChange={(visible) => setVisible(visible)}
                >
                  <Button>选择传感器</Button>
                </Popover>
              </Form.Item>
            </div>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};
