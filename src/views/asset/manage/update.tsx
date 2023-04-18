import { Form, Modal, ModalProps } from 'antd';
import * as React from 'react';
import { updateAsset } from '../services';
import { Asset, AssetRow } from '../types';
import { UpdateAssetForm } from './updateForm';
import intl from 'react-intl-universal';
import { useAssetCategoryChain } from '../../../config/assetCategory.config';

export const UpdateAsset: React.FC<ModalProps & { asset: AssetRow; onSuccess: () => void }> = (
  props
) => {
  const { asset, onSuccess } = props;
  const [form] = Form.useForm<Asset>();
  const {
    root: { label }
  } = useAssetCategoryChain();

  return (
    <Modal
      {...{
        title: intl.get('EDIT_SOMETHING', { something: intl.get(label) }),
        cancelText: intl.get('CANCEL'),
        okText: intl.get('SAVE'),
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
      <UpdateAssetForm form={form} asset={asset} />
    </Modal>
  );
};
