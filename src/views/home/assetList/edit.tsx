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
        bodyStyle: { overflow: 'auto', maxHeight: 610 },
        ...props,
        onOk: () => {
          form.validateFields().then((values) => {
            const _values = {
              ...values,
              attributes: {
                ...values.attributes,
                monitoring_points_num: Number(values.attributes?.monitoring_points_num),
                sub_type: Number(values.attributes?.sub_type),
                initial_preload: Number(values.attributes?.initial_preload),
                initial_pressure: Number(values.attributes?.initial_pressure)
              }
            };
            try {
              if (!doUpdating) {
                addAsset(_values as any).then(() => {
                  onSuccess();
                });
              } else if (asset) {
                updateAsset(asset.id, _values as any).then(() => {
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
      <Form form={form} labelCol={{ span: 5 }} validateMessages={defaultValidateMessages}>
        <EditContent
          parentId={parentId}
          initialIsFlangePreload={!!asset && doUpdating && !!asset.attributes?.sub_type}
        />
      </Form>
    </Modal>
  );
};
