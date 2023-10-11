import { Form, ModalProps } from 'antd';
import React from 'react';
import { Asset, AssetRow, updateAsset } from '../../asset';
import { UpdateForm } from './updateForm';
import intl from 'react-intl-universal';
import { ModalWrapper } from '../../../components/modalWrapper';

export const FlangeUpdate: React.FC<
  ModalProps & {
    onSuccess: () => void;
    flange: AssetRow;
  }
> = (props) => {
  const { flange, onSuccess } = props;
  const [form] = Form.useForm<Asset>();

  return (
    <ModalWrapper
      {...{
        title: intl.get('EDIT_SOMETHING', { something: intl.get('FLANGE') }),
        okText: intl.get('SAVE'),
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
              updateAsset(flange.id, _values as any).then(() => {
                onSuccess();
              });
            } catch (error) {
              console.log(error);
            }
          });
        }
      }}
    >
      <UpdateForm flange={flange} form={form} />
    </ModalWrapper>
  );
};
