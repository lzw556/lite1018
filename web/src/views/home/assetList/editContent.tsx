import { Form, Input, Select } from 'antd';
import * as React from 'react';
import { Rules } from '../../../constants/validator';
import { getAssets } from './services';
import { AssetTypes } from '../common/constants';
import { AssetRow } from './props';
import { AttributeFormItem } from './attributeFormItem';
import * as AppConfig from '../../../config';

export const EditContent: React.FC<{ parentId?: number }> = ({ parentId }) => {
  const [parents, setParents] = React.useState<AssetRow[]>([]);
  const topAssetName = AppConfig.use(window.assetCategory).topAsset.name;

  React.useEffect(() => {
    getAssets({ type: AssetTypes.WindTurbind.id }).then((assets) => setParents(assets));
  }, []);

  return (
    <>
      <Form.Item label='名称' name='name' rules={[Rules.range(4, 50)]}>
        <Input placeholder={`请填写${AssetTypes.Flange.label}名称`} />
      </Form.Item>
      <Form.Item name='type' hidden={true} initialValue={AssetTypes.Flange.id}></Form.Item>
      <Form.Item
        label={topAssetName}
        name='parent_id'
        hidden={!!parentId}
        initialValue={parentId}
        rules={[{ required: true, message: `请选择${topAssetName}` }]}
      >
        <Select placeholder={`请选择${topAssetName}`}>
          {parents.map(({ id, name }) => (
            <Select.Option key={id} value={id}>
              {name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      {AssetTypes.Flange.categories && (
        <Form.Item
          label={`${AssetTypes.Flange.label}类型`}
          name={['attributes', 'type']}
          rules={[{ required: true, message: `请选择${AssetTypes.Flange.label}类型` }]}
        >
          <Select placeholder={`请选择${AssetTypes.Flange.label}类型`}>
            {AssetTypes.Flange.categories.map(({ value, label }) => (
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
    </>
  );
};
