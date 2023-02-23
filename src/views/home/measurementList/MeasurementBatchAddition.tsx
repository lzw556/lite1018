import { MinusCircleOutlined } from '@ant-design/icons';
import { Button, Col, Divider, Form, Input, Modal, ModalProps, Popover, Row, Select } from 'antd';
import * as React from 'react';
import { defaultValidateMessages, Rules } from '../../../constants/validator';
import { AssetRow } from '../assetList/props';
import { getAssets } from '../assetList/services';
import { EditFormPayload } from '../common/useActionBarStatus';
import { addMeasurements } from '../summary/measurement/services';
import * as AppConfig from '../../../config';
import { DeviceSelection, MeasurementInfo } from './DeviceSelection';
import { measurementTypes as measurementType } from '../common/constants';
import { Device } from '../../../types/device';
import { GetDevicesRequest } from '../../../apis/device';

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
  const [selectedFlangeId, setSelectedFlangeId] = React.useState<number | undefined>(asset?.id);
  const [selectedFlange, setSelectedFlange] = React.useState<AssetRow | undefined>();
  const [selectedPointType, setSelectedPointType] = React.useState<number | undefined>();
  const [devices, setDevices] = React.useState<Device[]>([]);

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
    const flange = parents.find((asset) => asset.id === selectedFlangeId);
    setSelectedFlange(flange);
  }, [parents, selectedFlangeId, form]);

  React.useEffect(() => {
    if (selectedFlange?.attributes?.sub_type === 1) {
      setSelectedPointType(measurementType.preload.id);
    } else if (selectedPointType !== form.getFieldValue('type')) {
      setSelectedPointType(form.getFieldValue('type'));
      // form.setFieldValue('type', undefined);
    }
  }, [selectedFlange, form, selectedPointType]);

  React.useEffect(() => {
    setSelected([]);
  }, [selectedPointType]);

  React.useEffect(() => {
    if (selectedPointType) {
      const type = measurementTypes.find((type) => type.id === selectedPointType);
      GetDevicesRequest({ types: type?.deviceType.join(',') }).then(setDevices);
    }
  }, [selectedPointType, measurementTypes]);

  React.useEffect(() => {
    const inputs = form.getFieldsValue();
    const points: MeasurementInfo[] = inputs.monitoring_points;
    let values: MeasurementInfo[] = selected.map(
      ({ dev_name, dev_id, place, dev_type, channel }) => ({
        name: getPointName(dev_name, channel),
        place,
        dev_id,
        dev_name,
        dev_type,
        channel
      })
    );
    if (points && points.length > 0) {
      values = selected.map(({ dev_id, dev_name, channel }, index) => {
        const point = points.find((item) => dev_id === item.dev_id && item.channel === channel);
        if (point) {
          return point;
        } else {
          return { ...selected[index], name: getPointName(dev_name, channel) };
        }
      });
    }
    form.setFieldsValue({
      monitoring_points: values
    });
  }, [selected, form]);

  function getPointName(name: string, channel?: number) {
    return `${name}${channel ? `-通道${channel}` : ''}`;
  }

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
        title: `监测点添加`,
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
                        type: values.type ?? measurementType.preload.id,
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
                        type: values.type ?? measurementType.preload.id,
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
          <Select placeholder='请选择法兰' onChange={(id) => setSelectedFlangeId(id)}>
            {parents.map(({ id, name }) => (
              <Select.Option key={id} value={id}>
                {name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        {selectedFlange?.attributes?.sub_type === 1 ? (
          <Form.Item
            name='type'
            hidden={true}
            initialValue={measurementType.preload.id}
          ></Form.Item>
        ) : (
          <Form.Item label='类型' name='type' rules={[{ required: true, message: `请选择类型` }]}>
            <Select
              placeholder='请选择类型'
              onChange={(id) => {
                setSelectedPointType(id);
                // setSelected([]);
              }}
            >
              {measurementTypes
                .filter((type) => !type.hidden)
                .map(({ id, label }) => (
                  <Select.Option key={id} value={id}>
                    {label}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
        )}
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
                <Row key={key} style={{ position: 'relative' }} justify='space-between'>
                  <MinusCircleOutlined
                    onClick={() => {
                      remove(name);
                      setSelected((prev) => prev.filter((item, n) => n !== index));
                    }}
                    style={{ position: 'absolute', top: 10 }}
                  />
                  <Col offset={1}>
                    <Form.Item
                      label='名称'
                      labelCol={{ span: 6 }}
                      {...restFields}
                      name={[name, 'name']}
                      rules={[Rules.range(4, 16)]}
                      style={{ marginBottom: 0 }}
                    >
                      <Input placeholder={`请填写监测点名称`} />
                    </Form.Item>
                    <Form.Item name={[name, 'channel']} hidden={true}></Form.Item>
                  </Col>
                  <Col>
                    <Form.Item
                      label='位置'
                      labelCol={{ span: 6 }}
                      {...restFields}
                      name={[name, 'place']}
                      rules={[Rules.number, { validator: onNameValidator }]}
                      style={{ marginBottom: 0 }}
                    >
                      <Input placeholder={`请填写监测点位置`} style={{ width: 150 }} />
                    </Form.Item>
                  </Col>
                  <Divider />
                </Row>
              ))}
              <Form.ErrorList errors={errors} />
              <Form.Item wrapperCol={{ offset: 2 }}>
                <Popover
                  title='选择设备'
                  content={
                    visible && (
                      <DeviceSelection
                        devices={devices}
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
                  <Button disabled={selectedPointType === undefined}>选择传感器</Button>
                </Popover>
              </Form.Item>
            </div>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};
