import { Form, Modal, ModalProps } from 'antd';
import * as React from 'react';
import { defaultValidateMessages } from '../../../constants/validator';
import { EditFormPayload } from '../common/useActionBarStatus';
import { EditContent } from './editContent';
import { Asset, convertRow } from './props';
import { addAsset, updateAsset } from './services';
import * as AppConfig from '../../../config';

export const AssetEdit: React.FC<
  ModalProps & { payload?: EditFormPayload; onSuccess: () => void }
> = (props) => {
  const windConfig = AppConfig.use('wind');
  const { payload, onSuccess } = props;
  const asset = payload?.asset;
  const [form] = Form.useForm<Asset>();
  const doUpdating = asset && asset.type === windConfig.assetType.secondAsset?.id ? true : false;
  const parentId = asset && asset.type === windConfig.assetType.id ? asset.id : undefined;
  React.useEffect(() => {
    if (asset && doUpdating) {
      form.resetFields();
      const values = convertRow(asset);
      if (values) form.setFieldsValue(values);
    }
  }, [asset, form, doUpdating]);

  return (
    <Modal
      {...{
        title: `${windConfig.assetType.secondAsset?.label}${doUpdating ? '编辑' : '添加'}`,
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
        <EditContent parentId={parentId} />
      </Form>
    </Modal>
  );
};
