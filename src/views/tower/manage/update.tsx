import { Form, ModalProps } from 'antd';
import React from 'react';
import { Asset, AssetRow, updateAsset } from '../../asset';
import { UpdateForm } from './updateForm';
import intl from 'react-intl-universal';
import { ModalWrapper } from '../../../components/modalWrapper';

export const UpdateTower: React.FC<
  ModalProps & {
    onSuccess: () => void;
    tower: AssetRow;
  }
> = (props) => {
  const { tower, onSuccess } = props;
  const [form] = Form.useForm<Asset>();

  return (
    <ModalWrapper
      {...{
        title: intl.get('EDIT_SOMETHING', { something: intl.get('TOWER') }),
        okText: intl.get('SAVE'),
        ...props,
        onOk: () => {
          form.validateFields().then((values) => {
            try {
              updateAsset(tower.id, values).then(() => {
                onSuccess();
              });
            } catch (error) {
              console.log(error);
            }
          });
        }
      }}
    >
      <UpdateForm tower={tower} form={form} />
    </ModalWrapper>
  );
};
