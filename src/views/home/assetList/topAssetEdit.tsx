import { Form, Input, Modal, ModalProps, Select } from 'antd';
import * as React from 'react';
import * as AppConfig from '../../../config';
import { defaultValidateMessages, Rules } from '../../../constants/validator';
import { EditFormPayload } from '../common/useActionBarStatus';
import { Asset, AssetRow, convertRow } from './props';
import { addAsset, getAssets, updateAsset } from './services';

export const TopAssetEdit: React.FC<
  ModalProps & { payload?: EditFormPayload; onSuccess: () => void }
> = (props) => {
  const { payload, onSuccess } = props;
  const asset = payload?.asset;
  const [form] = Form.useForm<Asset>();

  const [parents, setParents] = React.useState<AssetRow[]>([]);
  const topAsset = AppConfig.use('default').assetType;

  React.useEffect(() => {
    getAssets({ type: topAsset.id }).then((assets) =>
      setParents(
        assets.filter((_asset) =>
          asset ? asset.id !== _asset.id && _asset.id <= asset.parentId : true
        )
      )
    );
  }, [asset, topAsset.id]);

  React.useEffect(() => {
    if (asset) {
      form.resetFields();
      const values = convertRow(asset);
      if (values) form.setFieldsValue(values);
    }
  }, [asset, form]);

  const doUpdating = !!asset;

  return (
    <Modal
      {...{
        title: `${topAsset.label}${doUpdating ? '编辑' : '添加'}`,
        cancelText: '取消',
        okText: doUpdating ? '更新' : '添加',
        ...props,
        onOk: () => {
          form.validateFields().then((values) => {
            try {
              if (!doUpdating) {
                addAsset({ ...values, parent_id: values.parent_id || 0 }).then(() => {
                  onSuccess();
                });
              } else if (asset) {
                updateAsset(asset.id, { ...values, parent_id: values.parent_id || 0 }).then(() => {
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
        <Form.Item label='名称' name='name' rules={[Rules.range(4, 50)]}>
          <Input placeholder={`请填写${topAsset.label}名称`} />
        </Form.Item>
        <Form.Item name='type' hidden={true} initialValue={topAsset.id}>
          <Input />
        </Form.Item>
        {parents.length > 0 && (
          <Form.Item label='上级资产' name='parent_id' hidden={asset && asset.parentId === 0}>
            <Select allowClear={true}>
              {parents.map(({ id, name }) => (
                <Select.Option key={id} value={id}>
                  {name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};
