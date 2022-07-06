import { Checkbox, Col, Divider, Empty, Form, Modal, ModalProps, Row, Spin } from 'antd';
import * as React from 'react';
import { AssetRow } from '../../../assetList/props';
import { getAssets } from '../../../assetList/services';
import { AssetTypes } from '../../../common/constants';
import { AlarmRule } from '../props';
import {
  bindMeasurementsToAlarmRule,
  bindMeasurementsToAlarmRule2,
  unbindMeasurementsToAlarmRule
} from '../services';

export const MeasurementBind: React.FC<
  ModalProps & { selectedRow: AlarmRule } & { onSuccess: () => void }
> = (props) => {
  const [form] = Form.useForm();
  const [winds, setWinds] = React.useState<AssetRow[]>();
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    getAssets({ type: AssetTypes.WindTurbind.id }).then((data) => {
      setLoading(false);
      setWinds(
        data.filter(
          ({ children }) =>
            children &&
            children.length > 0 &&
            children.some(
              ({ monitoringPoints }) =>
                monitoringPoints &&
                monitoringPoints.length > 0 &&
                monitoringPoints.some(({ type }) => type === props.selectedRow.type)
            )
        )
      );
      if (props.selectedRow.monitoringPoints && props.selectedRow.monitoringPoints.length > 0) {
        form.setFieldsValue({
          monitoring_point_ids: props.selectedRow.monitoringPoints.map(({ id }) => id)
        });
      }
    });
  }, [props, form]);
  const renderModalContent = () => {
    if (loading) return <Spin />;
    if (!winds || winds.length === 0) return <Empty description='暂无数据' />;
    return (
      <Form.Item name='monitoring_point_ids'>
        <Checkbox.Group style={{ width: '100%' }}>
          {winds.map(({ id, name, children }) => (
            <React.Fragment key={id}>
              <div>{name}</div>
              <Divider />
              {children &&
                children
                  .filter(({ monitoringPoints }) =>
                    monitoringPoints?.some(({ type }) => type === props.selectedRow.type)
                  )
                  .map(({ id, name, monitoringPoints }) => (
                    <Row key={id} gutter={[0, 16]} style={{ marginBottom: 16 }}>
                      <Col span={24}>{name}</Col>
                      <Col span={24}>
                        <Row>
                          {monitoringPoints &&
                            monitoringPoints.map(({ id, name, type }) => {
                              if (type === props.selectedRow.type) {
                                return (
                                  <Col key={id} span={8}>
                                    <Checkbox value={id}>{name}</Checkbox>
                                  </Col>
                                );
                              } else {
                                return null;
                              }
                            })}
                        </Row>
                      </Col>
                    </Row>
                  ))}
            </React.Fragment>
          ))}
        </Checkbox.Group>
      </Form.Item>
    );
  };

  return (
    <Modal
      width={800}
      title='编辑监测点'
      bodyStyle={{ maxHeight: 700, overflow: 'auto' }}
      {...props}
      okButtonProps={{ disabled: !winds || winds?.length === 0 }}
      onOk={() => {
        form.validateFields().then((values: { monitoring_point_ids?: number[] }) => {
          if (!values.monitoring_point_ids) props.onSuccess();
          // const oldIds: number[] = [];
          // if (props.selectedRow.monitoringPoints && props.selectedRow.monitoringPoints.length > 0) {
          //   oldIds.push(...props.selectedRow.monitoringPoints.map(({ id }) => id));
          // }
          //TODO

          // const newIds = values.monitoring_point_ids
          //   ? values.monitoring_point_ids.map((id) => id)
          //   : [];
          // const addIds = newIds.filter((id) => !oldIds.find((item) => item === id));
          // const removedIds = oldIds.filter((id) => !newIds.find((item) => item === id));
          // if (addIds.length > 0) {
          //   bindMeasurementsToAlarmRule(props.selectedRow.id, {
          //     monitoring_point_ids: addIds
          //   }).then(() => {
          //     props.onSuccess();
          //   });
          // }
          // if (removedIds.length > 0) {
          //   unbindMeasurementsToAlarmRule(props.selectedRow.id, {
          //     monitoring_point_ids: removedIds
          //   }).then(() => {
          //     props.onSuccess();
          //   });
          // }
          if (values.monitoring_point_ids) {
            bindMeasurementsToAlarmRule2(props.selectedRow.id, values).then(() =>
              props.onSuccess()
            );
          }
        });
      }}
    >
      <Form form={form}>{renderModalContent()}</Form>
    </Modal>
  );
};
