import { Checkbox, Form, Input, Select } from 'antd';
import * as React from 'react';
import { Rules } from '../../../constants/validator';
import { getAssets } from './services';
import { AssetRow } from './props';
import { AttributeFormItem } from './attributeFormItem';
import * as AppConfig from '../../../config';
import { SAMPLE_OFFSET, SAMPLE_PERIOD_2 } from '../../../constants';

export const EditContent: React.FC<{ parentId?: number; initialIsFlangePreload?: boolean }> = ({
  parentId,
  initialIsFlangePreload
}) => {
  const [parents, setParents] = React.useState<AssetRow[]>([]);
  const [isFlangePreload, setIsFlangePreload] = React.useState(initialIsFlangePreload);
  const windConfig = AppConfig.use('wind');

  React.useEffect(() => {
    getAssets({ type: windConfig.assetType.id }).then((assets) => setParents(assets));
  }, [windConfig.assetType.id]);

  return (
    <>
      <Form.Item label='名称' name='name' rules={[Rules.range(4, 50)]}>
        <Input placeholder={`请填写${windConfig.assetType.secondAsset?.label}名称`} />
      </Form.Item>
      <Form.Item
        name='type'
        hidden={true}
        initialValue={windConfig.assetType.secondAsset?.id}
      ></Form.Item>
      <Form.Item
        label={windConfig.assetType.label}
        name='parent_id'
        hidden={!!parentId}
        initialValue={parentId}
        rules={[{ required: true, message: `请选择${windConfig.assetType.label}` }]}
      >
        <Select placeholder={`请选择${windConfig.assetType.label}`}>
          {parents.map(({ id, name }) => (
            <Select.Option key={id} value={id}>
              {name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      {windConfig.assetType.secondAsset?.categories && (
        <Form.Item
          label={`${windConfig.assetType.secondAsset?.label}类型`}
          name={['attributes', 'type']}
          rules={[
            { required: true, message: `请选择${windConfig.assetType.secondAsset?.label}类型` }
          ]}
        >
          <Select placeholder={`请选择${windConfig.assetType.secondAsset?.label}类型`}>
            {windConfig.assetType.secondAsset?.categories.map(({ value, label }) => (
              <Select.Option key={value} value={value}>
                {label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      )}
      <Form.Item label='序号' name={['attributes', 'index']} initialValue={1}>
        <Select placeholder='请选择序号'>
          {[1, 2, 3, 4, 5].map((item) => (
            <Select.Option key={item} value={item}>
              {item}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <AttributeFormItem label='额定值' name='normal' />
      <AttributeFormItem label='初始值' name='initial' />
      <AttributeFormItem label='次要报警' name='info' />
      <AttributeFormItem label='重要报警' name='warn' />
      <AttributeFormItem label='紧急报警' name='danger' />
      <Form.Item
        name={['attributes', 'sub_type']}
        valuePropName='checked'
        wrapperCol={{ offset: 4 }}
        initialValue={false}
      >
        <Checkbox onChange={(e) => setIsFlangePreload(e.target.checked)}>计算法兰预紧力</Checkbox>
      </Form.Item>
      {isFlangePreload && (
        <>
          <Form.Item
            label='螺栓数量'
            name={['attributes', 'monitoring_points_num']}
            rules={[Rules.number]}
          >
            <Input placeholder={`请填写螺栓数量`} />
          </Form.Item>
          <Form.Item
            label='采集周期'
            name={['attributes', 'sample_period']}
            rules={[{ required: true, message: '请选择采集周期' }]}
          >
            <Select placeholder={'请选择采集周期'}>
              {SAMPLE_PERIOD_2.map((item) => (
                <Select.Option key={item.value} value={item.value}>
                  {item.text}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label='采集延迟'
            name={['attributes', 'sample_time_offset']}
            rules={[{ required: true, message: '请选择采集延迟' }]}
          >
            <Select placeholder={'请选择采集延迟'}>
              {SAMPLE_OFFSET.map((item) => (
                <Select.Option key={item.value} value={item.value}>
                  {item.text}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label='初始预紧力'
            name={['attributes', 'initial_preload']}
            rules={[Rules.number]}
          >
            <Input placeholder={`请填写初始预紧力`} suffix='kN' />
          </Form.Item>
          <Form.Item
            label='初始应力'
            name={['attributes', 'initial_pressure']}
            rules={[Rules.number]}
          >
            <Input placeholder={`请填写初始应力`} suffix='MPa' />
          </Form.Item>
        </>
      )}
    </>
  );
};
