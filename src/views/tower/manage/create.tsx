import { Form, ModalProps } from 'antd';
import React from 'react';
import { addAsset, Asset } from '../../asset';
import intl from 'react-intl-universal';
import { CreateForm } from './createForm';
import { ModalWrapper } from '../../../components/modalWrapper';

export const CreateTower: React.FC<
  ModalProps & {
    onSuccess: () => void;
    parentId?: number;
  }
> = (props) => {
  const { onSuccess, parentId } = props;
  const [form] = Form.useForm<Asset>();

  return (
    <ModalWrapper
      {...{
        title: intl.get('CREATE_SOMETHING', { something: intl.get('TOWER') }),
        okText: intl.get('CREATE'),
        ...props,
        onOk: () => {
          form.validateFields().then((values) => {
            try {
              addAsset(values).then(() => {
                onSuccess();
              });
            } catch (error) {
              console.log(error);
            }
          });
        }
      }}
    >
      <CreateForm form={form} parentId={parentId} />
    </ModalWrapper>
  );
};
