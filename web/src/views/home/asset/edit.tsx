import { Form, Input, Modal, ModalProps, Select } from 'antd';
import * as React from 'react';
import { defaultValidateMessages, Rules } from '../../../constants/validator';
import { AssetTypes } from '../constants';
import { Asset, AssetRow, convertRow } from './props';
import { addAsset, getAssets, updateAsset } from './services';

export const AssetEdit: React.FC<
  ModalProps & { selectedRow?: AssetRow } & {
    initialValues?: typeof AssetTypes.WindTurbind;
  } & { onSuccess: () => void }
> = (props) => {
  const { selectedRow, initialValues, onSuccess } = props;
  const { id } = selectedRow || {};
  const { id: assetTypeId, label, parent_id } = initialValues || {};
  const [form] = Form.useForm<Asset>();
  const [parents, setParents] = React.useState<AssetRow[]>([]);

  React.useEffect(() => {
    getAssets({ type: AssetTypes.WindTurbind.id }).then((assets) => setParents(assets));
  }, []);

  React.useEffect(() => {
    form.resetFields();
    const values = convertRow(selectedRow);
    if (values) form.setFieldsValue(values);
  }, [form, selectedRow]);

  return (
    <Modal
      {...{
        title: id ? `${label}编辑` : `${label}添加`,
        cancelText: '取消',
        okText: id ? '更新' : '添加',
        ...props,
        onOk: () => {
          form.validateFields().then((values) => {
            const { id } = values;
            try {
              if (!id) {
                addAsset(values).then(() => {
                  onSuccess();
                });
              } else {
                updateAsset(id, values).then(() => {
                  onSuccess();
                });
              }
            } catch (error) {
              console.log(error);
            }
          });
        }
      }}
    >
      <Form form={form} labelCol={{ span: 4 }} validateMessages={defaultValidateMessages}>
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
      </Form>
    </Modal>
  );
};
