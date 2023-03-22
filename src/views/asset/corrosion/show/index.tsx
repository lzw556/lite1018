import { Col, Row, Spin } from 'antd';
import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import ShadowCard from '../../../../components/shadowCard';
import { AssetAlarmStatistic, AssetNavigator, useAssetsContext } from '../../components';
import { AssetRow } from '../../types';
import { useActionBarStatus } from '../common/useActionBarStatus';
import { getAsset } from '../../services';
import { INVALID_AREA } from '../config';
import { AreaTree } from '../tree-list/tree';
import intl from 'react-intl-universal';

export default function AreaShow() {
  const { id } = useParams();
  const { state } = useLocation();
  const { assets, refresh } = useAssetsContext();
  const [wind, setWind] = React.useState<AssetRow>();
  const [loading, setLoading] = React.useState(true);
  const actionStatus = useActionBarStatus();

  const fetchWind = (id: number) => {
    getAsset(id).then((wind) => {
      setLoading(false);
      setWind(wind);
    });
  };

  React.useEffect(() => {
    fetchWind(Number(id));
  }, [id]);

  if (loading) return <Spin />;
  if (wind === undefined) return <p>{intl.get(INVALID_AREA)}</p>;

  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <AssetNavigator id={wind.id} parentId={wind.parentId} assets={assets} from={state?.from} />
      </Col>
      <Col span={24}>
        <AssetAlarmStatistic {...wind} />
      </Col>
      <Col span={24}>
        <ShadowCard>
          <AreaTree
            assets={wind ? [wind] : []}
            {...actionStatus}
            rootId={wind?.id}
            onSuccess={() => {
              refresh();
              fetchWind(Number(id));
            }}
          />
        </ShadowCard>
      </Col>
    </Row>
  );
}
