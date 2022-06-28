import { Form, Modal, ModalProps } from 'antd';
import * as React from 'react';
import { defaultValidateMessages } from '../../../constants/validator';
import { AssetTypes } from '../common/constants';
import { EditContent } from './editContent';
import { Asset, AssetRow, convertRow } from './props';
import { addAsset, updateAsset } from './services';

export const AssetEdit: React.FC<
  ModalProps & { selectedRow?: AssetRow } & {
    initialValues?: typeof AssetTypes.WindTurbind;
  } & { onSuccess: () => void }
> = (props) => {
  const { selectedRow, initialValues, onSuccess } = props;
  const { id } = selectedRow || {};
  const { label } = initialValues || {};
  const [form] = Form.useForm<Asset>();

  React.useEffect(() => {
    form.resetFields();
    const values = convertRow(selectedRow);
    if (values) form.setFieldsValue(values);
  }, [form, selectedRow]);

  return (
    <Modal
      {...{
        title: id ? `${label}编辑` : `${label}添加`,
        cancelText: '取消',
        okText: id ? '更新' : '添加',
        ...props,
        onOk: () => {
          form.validateFields().then((values) => {
            const { id } = values;
            try {
              if (!id) {
                addAsset(values).then(() => {
                  onSuccess();
                });
              } else {
                updateAsset(id, values).then(() => {
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
        <EditContent initialValues={initialValues} id={id}/>
      </Form>
    </Modal>
  );
};
