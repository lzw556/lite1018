import useSocket, { SocketTopic } from '../../socket';
import { notification, Space } from 'antd';
import { useEffect } from 'react';
import { getProject } from '../../utils/session';
import intl from 'react-intl-universal';

const AlertMessageNotification = () => {
  const { PubSub } = useSocket();
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    PubSub.subscribe(SocketTopic.monitoringPointAlert, (msg: string, data: any) => {
      console.log(data);
      if (
        data &&
        data.monitoringPoint &&
        data.monitoringPoint.project &&
        data.monitoringPoint.project === getProject()
      )
        renderNotification(data);
    });
    return () => {
      PubSub.unsubscribe(SocketTopic.monitoringPointAlert);
    };
  }, []);

  const renderNotification = (record: any) => {
    console.log(`notification ${record}`);
    switch (record.level) {
      case 1:
        api.info({
          key: `${record.monitoringPoint.id}-${record.level}`,
          message: intl.get('ALARM_LEVEL_MINOR_TITLE'),
          description: <div>{renderDescription(record)}</div>
        });
        break;
      case 2:
        api.warning({
          key: `${record.monitoringPoint.id}-${record.level}`,
          message: intl.get('ALARM_LEVEL_MAJOR_TITLE'),
          description: <div>{renderDescription(record)}</div>
        });
        break;
      case 3:
        api.error({
          key: `${record.monitoringPoint.id}-${record.level}`,
          message: intl.get('ALARM_LEVEL_CRITICAL_TITLE'),
          description: <div>{renderDescription(record)}</div>
        });
        break;
      default:
        api.success({
          key: `${record.monitoringPoint.id}-${record.level}`,
          message: intl.get('RETURN_TO_NORMAL'),
          description: <div>{renderDescription(record)}</div>
        });
        break;
    }
  };

  const renderDescription = (record: any) => {
    return (
      <>
        <p>{`${intl.get('ALARM_MONITORING_POINTS')}: ${record.monitoringPoint.name}`}</p>
        <p>{`${intl.get('ALARM_PROPERTIES')}: ${intl.get(record.metric.name)}`}</p>
        <p>{`${intl.get('ALARM_VALUE')}: ${record.value}`}</p>
      </>
    );
  };

  return (
    <div style={{ position: 'fixed', top: 0, right: 0, padding: '8px' }}>
      <Space direction={'vertical'}>{contextHolder}</Space>
    </div>
  );
};

export default AlertMessageNotification;
