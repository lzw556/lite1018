import { Col, Empty, Modal, ModalProps, Row, Spin } from 'antd';
import * as React from 'react';
import { AssetRow } from '../../asset/props';
import { getAssets } from '../../asset/services';
import { AssetTypes } from '../../common/constants';
import { AlarmRule } from '../props';

export const MeasurementBind: React.FC<ModalProps & { selectedRow?: AlarmRule }> = (props) => {
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
            children.every(
              ({ monitoringPoints }) => monitoringPoints && monitoringPoints.length > 0
            )
        )
      );
    });
  }, []);
  const renderModalContent = () => {
    if (loading) return <Spin />;
    if (!winds || winds.length === 0) return <Empty description='暂无数据' />;
    return winds.map(({ id, name, children }) => (
      <React.Fragment key={id}>
        <p>{name}</p>
        {children &&
          children.map(({ id, name, monitoringPoints }) => (
            <Row key={id}>
              <Col span={24}>{name}</Col>
              <Col span={24}>
                <Row>
                  {monitoringPoints &&
                    monitoringPoints.map(({ id, name }) => (
                      <Col key={id} span={4}>
                        <p>{name}</p>
                      </Col>
                    ))}
                </Row>
              </Col>
            </Row>
          ))}
      </React.Fragment>
    ));
  };

  return (
    <Modal
      title='编辑监测点'
      {...props}
      okButtonProps={{ disabled: !winds || winds?.length === 0 }}
    >
      {renderModalContent()}
    </Modal>
  );
};
