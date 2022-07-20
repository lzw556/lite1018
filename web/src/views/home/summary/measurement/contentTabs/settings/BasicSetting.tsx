import { Button, Col, Form, Input, Row, Select } from 'antd';
import React from 'react';
import DeviceSelect from '../../../../../../components/select/deviceSelect';
import { defaultValidateMessages, Rules } from '../../../../../../constants/validator';
import { DeviceType } from '../../../../../../types/device_type';
import { isMobile } from '../../../../../../utils/deviceDetection';
import { AssetRow } from '../../../../assetList/props';
import { getAssets } from '../../../../assetList/services';
import { AssetTypes, MeasurementTypes } from '../../../../common/constants';
import { convertRow, Measurement, MeasurementRow } from '../../props';
import { bindDevice, unbindDevice, updateMeasurement } from '../../services';

export const BasicSetting: React.FC<MeasurementRow & { onUpdate?: () => void }> = (props) => {
  const [types, setTypes] = React.useState([DeviceType.BoltLoosening, DeviceType.BoltElongation]);
  const { id, bindingDevices } = props;
  const [form] = Form.useForm<Measurement & { device_id: number }>();
  const [parents, setParents] = React.useState<AssetRow[]>([]);

  React.useEffect(() => {
    getAssets({ type: AssetTypes.Flange.id }).then((assets) => {
      const local = localStorage.getItem('measurementListFilters');
      const filters: { windTurbineId: number } = local ? JSON.parse(local) : null;
      setParents(
        assets.filter((asset) => (filters ? filters.windTurbineId === asset.parentId : true))
      );
    });
  }, []);

  React.useEffect(() => {
    form.resetFields();
    const values = convertRow(props);
    if (values) {
      const type = Object.values(MeasurementTypes).find((type) => type.id === values.type);
      if (type) setTypes([type.deviceType]);
      form.setFieldsValue(values);
    }
  }, [form, props]);

  return (
    <Row>
      <Col span={isMobile ? 16 :8}>
        <Form form={form} labelCol={{ span: 4 }} validateMessages={defaultValidateMessages}>
          <Form.Item label='id' name='id' hidden={true}>
            <Input />
          </Form.Item>
          <Form.Item label='名称' name='name' rules={[Rules.range(4, 50)]}>
            <Input placeholder={`请填写监测点名称`} />
          </Form.Item>
          <Form.Item label='类型' name='type' rules={[{ required: true, message: `请选择类型` }]}>
            <Select placeholder='请选择类型' disabled={!!id}>
              {Object.values(MeasurementTypes).map(({ id, label }) => (
                <Select.Option key={id} value={id}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          {/* TODO */}
          {/* <Form.Item label='法兰' name='asset_id' rules={[{ required: true, message: `请选择法兰` }]}>
          <Cascader options={parents} fieldNames={{ label: 'name', value: 'id' }} />
        </Form.Item> */}
          <Form.Item
            label='传感器'
            name='device_id'
            rules={[{ required: true, message: `请选择传感器` }]}
          >
            <DeviceSelect filters={{ types: types.join(',') }} />
          </Form.Item>
          <Form.Item
            label='法兰'
            name='asset_id'
            rules={[{ required: true, message: `请选择法兰` }]}
          >
            <Select placeholder='请选择法兰'>
              {parents.map(({ id, name }) => (
                <Select.Option key={id} value={id}>
                  {name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label='序号' name={['attributes', 'index']} initialValue={1}>
            <Select placeholder='请选择序号'>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <Select.Option key={item} value={item}>
                  {item}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item style={{ textAlign: 'right' }}>
            <Button
              type='primary'
              onClick={() => {
                form.validateFields().then((values) => {
                  if (
                    bindingDevices &&
                    bindingDevices.length > 0 &&
                    bindingDevices[0].id !== values.device_id
                  ) {
                    unbindDevice(id, bindingDevices[0].id);
                    bindDevice(id, values.device_id);
                  } else if (!bindingDevices || bindingDevices.length === 0) {
                    bindDevice(id, values.device_id);
                  }
                  updateMeasurement(id, values).then(() => {
                    props.onUpdate && props.onUpdate();
                  });
                });
              }}
            >
              保存
            </Button>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  );
};
