import { Form, Input, Modal, ModalProps } from 'antd';
import * as React from 'react';
import { defaultValidateMessages, Rules } from '../../../constants/validator';
import { AssetTypes } from '../common/constants';
import { EditFormPayload } from '../common/useActionBarStatus';
import { Asset, convertRow } from './props';
import { addAsset, updateAsset } from './services';

export const WindEdit: React.FC<
  ModalProps & { payload?: EditFormPayload; onSuccess: () => void }
> = (props) => {
  const { payload, onSuccess } = props;
  const asset = payload?.asset;
  const [form] = Form.useForm<Asset>();

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
        title: `${AssetTypes.WindTurbind.label}${doUpdating ? '编辑' : '添加'}`,
        cancelText: '取消',
        okText: doUpdating ? '更新' : '添加',
        ...props,
        onOk: () => {
          form.validateFields().then((values) => {
            try {
              if (!doUpdating) {
                addAsset(values).then(() => {
                  onSuccess();
                });
              } else if (asset) {
                updateAsset(asset.id, values).then(() => {
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
          <Input placeholder={`请填写${AssetTypes.WindTurbind.label}名称`} />
        </Form.Item>
        <Form.Item name='type' hidden={true} initialValue={AssetTypes.WindTurbind.id}></Form.Item>
      </Form>
    </Modal>
  );
};
