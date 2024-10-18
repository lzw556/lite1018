import * as React from 'react';
import { Col, Empty, Row, Spin, Table } from 'antd';
import intl from 'react-intl-universal';
import dayjs from '../../../../utils/dayjsUtils';
import { RangeDatePicker, oneWeekNumberRange } from '../../../../components/rangeDatePicker';
import { AssetRow, getDataOfAsset, getFlangeData, Point } from '../../../asset-common';
import { SingleStatus, StatusData } from './single';

export const Status: React.FC<AssetRow> = (props) => {
  const [range, setRange] = React.useState<[number, number]>(oneWeekNumberRange);
  const [timestamps, setTimestamps] = React.useState<{ timestamp: number }[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [timestamp, setTimestamp] = React.useState<number>();
  const [loading2, setLoading2] = React.useState(true);
  const [flangeData, setFlangeData] = React.useState<StatusData>();

  React.useEffect(() => {
    if (range) {
      const [from, to] = range;
      getDataOfAsset(props.id, from, to).then((data) => {
        setTimestamps(data);
        setLoading(false);
      });
    }
  }, [range, props.id]);

  React.useEffect(() => {
    if (timestamps.length > 0) {
      setTimestamp(timestamps[0].timestamp);
    } else {
      setTimestamp(undefined);
    }
  }, [timestamps]);

  React.useEffect(() => {
    if (timestamp) {
      setLoading2(true);
      getFlangeData(props.id, timestamp).then((data) => {
        setFlangeData(data);
        setLoading2(false);
      });
    }
  }, [props.id, timestamp]);

  const renderTimestampsSearchResult = () => {
    if (loading) return <Spin />;
    let content = null;
    if (timestamps.length === 0) {
      content = (
        <Col span={24}>
          <Empty description={intl.get('NO_DATA_PROMPT')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </Col>
      );
    } else {
      content = (
        <>
          <Col span={6}>{renderTimestampsTable()}</Col>
          <Col span={18}>{renderSelectedTimestampRelation()}</Col>
        </>
      );
    }
    return <Row>{content}</Row>;
  };

  const renderTimestampsTable = () => {
    return (
      <Table
        size={'middle'}
        scroll={{ y: 500 }}
        showHeader={false}
        columns={[
          {
            title: intl.get('TIMESTAMP'),
            dataIndex: 'timestamp',
            key: 'timestamp',
            width: '80%',
            render: (timestamp: number) =>
              dayjs.unix(timestamp).local().format('YYYY-MM-DD HH:mm:ss')
          }
        ]}
        pagination={false}
        dataSource={timestamps}
        rowClassName={(record) => (record.timestamp === timestamp ? 'ant-table-row-selected' : '')}
        onRow={(record) => ({
          onClick: () => {
            if (record.timestamp !== timestamp) {
              setTimestamp(record.timestamp);
            }
          },
          onMouseLeave: () => (window.document.body.style.cursor = 'default'),
          onMouseEnter: () => (window.document.body.style.cursor = 'pointer')
        })}
      />
    );
  };

  const renderSelectedTimestampRelation = () => {
    if (!timestamp)
      return (
        <Empty
          description={intl.get('PLEASE_SELECT_SOMETHING', { something: intl.get('TIMESTAMP') })}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    if (loading2) return <Spin />;
    return (
      <SingleStatus
        properties={
          props.monitoringPoints && props.monitoringPoints.length > 0
            ? Point.getPropertiesByType(
                props.monitoringPoints[0].properties,
                props.monitoringPoints[0].type
              )
            : []
        }
        flangeData={flangeData}
      />
    );
  };

  return (
    <Row gutter={[0, 16]}>
      <Col span={24}>
        <RangeDatePicker onChange={setRange} />
      </Col>
      <Col span={24}>{renderTimestampsSearchResult()}</Col>
    </Row>
  );
};
