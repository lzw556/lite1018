import { Form, ModalProps } from 'antd';
import React from 'react';
import { addAsset, Asset } from '../../asset';
import intl from 'react-intl-universal';
import { CreateForm } from './createForm';
import { ModalWrapper } from '../../../components/modalWrapper';

export const FlangeCreate: React.FC<
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
        title: intl.get('CREATE_SOMETHING', { something: intl.get('FLANGE') }),
        okText: intl.get('CREATE'),
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
              addAsset(_values as any).then(() => {
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
