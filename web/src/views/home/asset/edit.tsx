import { Form, Input, Modal, ModalProps, Select } from 'antd';
import * as React from 'react';
import { defaultValidateMessages, Rules } from '../../../constants/validator';
import { AssetTypes } from './constants';
import { Asset, AssetRow, convertRow, filterAssets } from './props';
import { addAsset, getAssets, updateAsset } from './services';

export const AssetEdit: React.FC<
  ModalProps & { selectedRow?: AssetRow } & {
    initialValues?: typeof AssetTypes.WindTurbind;
  } & { onSuccess: () => void }
> = (props) => {
  const { selectedRow, initialValues, onSuccess } = props;
  const { ID } = selectedRow || {};
  const { type, label, parent_id } = initialValues || {};
  const [form] = Form.useForm<Asset>();
  const [parents, setParents] = React.useState<AssetRow[]>([
    { ID: 0, Name: '', Type: 0, ParentID: -1, ProjectID: 1 }
  ]);

  React.useEffect(() => {
    getAssets().then((assets) => setParents(filterAssets(assets, 'WindTurbind')));
  }, []);

  React.useEffect(() => {
    form.resetFields();
    const values = convertRow(selectedRow);
    if (values) form.setFieldsValue(values);
  }, [form, selectedRow]);

  return (
    <Modal
      {...{
        title: ID ? `${label}编辑` : `${label}添加`,
        cancelText: '取消',
        okText: ID ? '更新' : '添加',
        ...props,
        onOk: () => {
          form.validateFields().then((values) => {
            console.log(values);
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
        {ID && (
          <Form.Item label='id' name='id' hidden={true}>
            <Input />
          </Form.Item>
        )}
        <Form.Item label='名称' name='name' rules={[Rules.range(4, 50)]}>
          <Input placeholder={`请填写${label}名称`} />
        </Form.Item>
        <Form.Item label='类型' name='type' hidden={!!type} initialValue={type}>
          <Select>
            {Object.values(AssetTypes).map(({ type, label }) => (
              <Select.Option key={type} value={type}>
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
            {parents.map(({ ID, Name }) => (
              <Select.Option key={ID} value={ID}>
                {Name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};
