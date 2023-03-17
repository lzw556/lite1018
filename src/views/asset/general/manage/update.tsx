import { Form, Modal, ModalProps } from 'antd';
import * as React from 'react';
import { updateAsset } from '../../services';
import { Asset, AssetRow } from '../../types';
import { UPDATE_GENERAL } from '../common/types';
import { UpdateForm } from './updateForm';

export const GeneralUpdate: React.FC<
  ModalProps & { asset: AssetRow; parents?: AssetRow[]; onSuccess: () => void }
> = (props) => {
  const { asset, parents, onSuccess } = props;
  const [form] = Form.useForm<Asset>();

  return (
    <Modal
      {...{
        title: UPDATE_GENERAL,
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
      <UpdateForm form={form} general={asset} parents={parents} />
    </Modal>
  );
};
