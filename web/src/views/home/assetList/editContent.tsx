import { Form, Input, Select } from 'antd';
import * as React from 'react';
import { Rules } from '../../../constants/validator';
import { getAssets } from './services';
import { AssetTypes } from '../common/constants';
import { AssetRow } from './props';
import { AttributeFormItem } from './attributeFormItem';

export const EditContent: React.FC<{
  initialValues?: typeof AssetTypes.WindTurbind;
  id?: number;
}> = ({ initialValues, id }) => {
  const { id: assetTypeId, label, parent_id } = initialValues || {};
  const [parents, setParents] = React.useState<AssetRow[]>([]);

  React.useEffect(() => {
    getAssets({ type: AssetTypes.WindTurbind.id }).then((assets) => setParents(assets));
  }, []);

  return (
    <>
      {id && (
        <Form.Item label='id' name='id' hidden={true}>
          <Input />
        </Form.Item>
      )}
      <Form.Item label='名称' name='name' rules={[Rules.range(4, 50)]}>
        <Input placeholder={`请填写${label}名称`} />
      </Form.Item>
      <Form.Item label='类型' name='type' hidden={!!assetTypeId} initialValue={assetTypeId}>
        <Select>
          {Object.values(AssetTypes).map(({ id, label }) => (
            <Select.Option key={id} value={id}>
              {label}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        label='风机'
        name='parent_id'
        hidden={!!parent_id || parent_id === 0}
        initialValue={parent_id}
        rules={[{ required: true, message: `请选择风机` }]}
      >
        <Select placeholder='请选择风机'>
          {parents.map(({ id, name }) => (
            <Select.Option key={id} value={id}>
              {name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      {AssetTypes.Flange.categories && assetTypeId !== AssetTypes.WindTurbind.id && (
        <Form.Item
          label='法兰类型'
          name={['attributes', 'type']}
          rules={[{ required: true, message: `请选择法兰类型` }]}
        >
          <Select placeholder='请选择法兰类型'>
            {AssetTypes.Flange.categories.map(({ value, label }) => (
              <Select.Option key={value} value={value}>
                {label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      )}
      {AssetTypes.Flange.categories && assetTypeId !== AssetTypes.WindTurbind.id && (
        <Form.Item label='序号' name={['attributes', 'index']} initialValue={1}>
          <Select placeholder='请选择序号'>
            {[1, 2, 3, 4, 5].map((item) => (
              <Select.Option key={item} value={item}>
                {item}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      )}
      {AssetTypes.Flange.categories && assetTypeId !== AssetTypes.WindTurbind.id && (
        <AttributeFormItem label='额定值' name='normal' />
      )}
      {AssetTypes.Flange.categories && assetTypeId !== AssetTypes.WindTurbind.id && (
        <AttributeFormItem label='初始值' name='initial' />
      )}
      {AssetTypes.Flange.categories && assetTypeId !== AssetTypes.WindTurbind.id && (
        <AttributeFormItem label='次要' name='info' />
      )}
      {AssetTypes.Flange.categories && assetTypeId !== AssetTypes.WindTurbind.id && (
        <AttributeFormItem label='重要' name='warn' />
      )}
      {AssetTypes.Flange.categories && assetTypeId !== AssetTypes.WindTurbind.id && (
        <AttributeFormItem label='严重' name='danger' />
      )}
    </>
  );
};
