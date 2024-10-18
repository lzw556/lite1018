import React from 'react';
import { Form } from 'antd';
import intl from 'react-intl-universal';
import { ModalFormProps } from '../../../types/common';
import { useLocaleFormLayout } from '../../../hooks/useLocaleFormLayout';
import { ModalWrapper } from '../../../components/modalWrapper';
import { MONITORING_POINT, MonitoringPoint, MonitoringPointRow, Point } from '../../asset-common';
import { UpdateFormItems } from './_updateFormItems';
import { handleSubmit, parseAttrs } from './common';

export const UpdateModal = (props: ModalFormProps & { monitoringPoint: MonitoringPointRow }) => {
  const { monitoringPoint, onSuccess, ...rest } = props;
  const [form] = Form.useForm<MonitoringPoint & { device_id: number }>();

  return (
    <ModalWrapper
      {...{
        afterClose: () => form.resetFields(),
        title: intl.get('EDIT_SOMETHING', { something: intl.get(MONITORING_POINT) }),
        okText: intl.get('SAVE'),
        ...rest,
        onOk: () => {
          form.validateFields().then((values) => {
            handleSubmit(monitoringPoint, values, onSuccess);
          });
        }
      }}
    >
      <Form
        form={form}
        {...useLocaleFormLayout()}
        initialValues={{ ...Point.convert(monitoringPoint, parseAttrs) }}
      >
        <UpdateFormItems {...monitoringPoint} />
      </Form>
    </ModalWrapper>
  );
};
