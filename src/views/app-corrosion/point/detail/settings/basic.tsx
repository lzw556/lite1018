import React from 'react';
import { Button, Col, Form, Row } from 'antd';
import intl from 'react-intl-universal';
import { Flex } from '../../../../../components';
import { useLocaleFormLayout } from '../../../../../hooks/useLocaleFormLayout';
import { UpdateFormItems } from '../../_updateFormItems';
import { MonitoringPoint, MonitoringPointRow, Point } from '../../../../asset-common';
import { generateColProps } from '../../../../../utils/grid';
import { handleSubmit, parseAttrs } from '../../common';

export const Basic = (props: { monitoringPoint: MonitoringPointRow; onSuccess: () => void }) => {
  const { monitoringPoint, onSuccess } = props;
  const [form] = Form.useForm<MonitoringPoint & { device_id: number }>();
  return (
    <Row>
      <Col {...generateColProps({ md: 12, lg: 12, xl: 12, xxl: 8 })}>
        <Form
          form={form}
          {...useLocaleFormLayout()}
          initialValues={{ ...Point.convert(monitoringPoint, parseAttrs) }}
        >
          <UpdateFormItems {...monitoringPoint} />
          <Flex style={{ marginTop: 12 }}>
            <Button
              type='primary'
              onClick={() => {
                form.validateFields().then((values) => {
                  handleSubmit(monitoringPoint, values, onSuccess);
                });
              }}
            >
              {intl.get('SAVE')}
            </Button>
          </Flex>
        </Form>
      </Col>
    </Row>
  );
};
