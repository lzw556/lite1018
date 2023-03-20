import { Form, Modal, ModalProps } from 'antd';
import * as React from 'react';
import { updateAsset } from '../../services';
import { Asset, AssetRow } from '../../types';
import { UPDATE_AREA } from '../config';
import { UpdateForm } from './updateForm';

export const AreaUpdate: React.FC<ModalProps & { asset: AssetRow; onSuccess: () => void }> = (
  props
) => {
  const { asset, onSuccess } = props;
  const [form] = Form.useForm<Asset>();

  return (
    <Modal
      {...{
        title: UPDATE_AREA,
        cancelText: '取消',
        okText: '编辑',
        ...props,
        onOk: () => {
          form.validateFields().then((values) => {
            try {
              updateAsset(asset.id, values).then(() => {
                onSuccess();
              });
            } catch (error) {
              console.log(error);
            }
          });
        }
      }}
    >
      <UpdateForm form={form} general={asset} />
    </Modal>
  );
};
