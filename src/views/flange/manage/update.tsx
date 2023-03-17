import { Form, Modal, ModalProps } from 'antd';
import React from 'react';
import { Asset, AssetRow, updateAsset } from '../../asset';
import { UPDATE_FLANGE } from '../types';
import { UpdateForm } from './updateForm';

export const FlangeUpdate: React.FC<
  ModalProps & {
    windTurbines: AssetRow[];
    onSuccess: () => void;
    flange: AssetRow;
  }
> = (props) => {
  const { flange, windTurbines = [], onSuccess } = props;
  const [form] = Form.useForm<Asset>();

  return (
    <Modal
      {...{
        title: UPDATE_FLANGE,
        cancelText: '取消',
        okText: '编辑',
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
      <UpdateForm flange={flange} form={form} windTurbines={windTurbines} />
    </Modal>
  );
};
