import React from 'react';
import { Pagination, Space } from 'antd';
import intl from 'react-intl-universal';
import { NameValueGroups } from '../../../components/name-values';
import { convertAlarmLevelToState } from '../../../types/alarm';
import { getValue, roundValue } from '../../../utils/format';
import { ASSET_PATHNAME, AssetRow, Introduction, Point } from '../../asset-common';
import { Icon } from '../icon';

export const OverviewCard = ({ asset }: { asset: AssetRow }) => {
  const { alertLevel, id, monitoringPoints = [], name, type } = asset;
  const alarmState = convertAlarmLevelToState(alertLevel);
  const items = monitoringPoints.map(({ name, data, properties, type }) => {
    const property = Point.getPropertiesByType(properties, type).filter((p) => p.first)?.[0];
    const key =
      property.fields && property.fields.length > 1
        ? property.fields[property.fields.length - 1].key
        : property.key;
    let value = NaN;
    if (data && data.values && data.values[key] !== undefined) {
      value = data.values[key] as number;
    }
    return {
      name,
      value: property && (
        <Space>
          <span style={{ color: '#8a8e99' }}>{intl.get(property.name)}</span>
          <strong>{getValue(roundValue(value, property.precision))}</strong>
          {/* <span>{property.unit ? property.unit : ''}</span> */}
        </Space>
      )
    };
  });
  const [page, setPage] = React.useState(1);
  return (
    <Introduction
      {...{
        className: 'shadow',
        title: {
          name: name,
          path: `/${ASSET_PATHNAME}/${id}-${type}`,
          state: [`${id}-${type}`]
        },
        alarmState,
        icon: {
          svg: <Icon asset={asset} style={{ fill: '#fff' }} />,
          small: true
        },
        count:
          items.length > 0 ? (
            <>
              <NameValueGroups col={{ span: 20 }} items={items.slice(4 * (page - 1), 4 * page)} />
              <Pagination
                align='end'
                hideOnSinglePage={true}
                onChange={setPage}
                pageSize={4}
                simple={{ readOnly: true }}
                size='small'
                style={{ marginTop: 12 }}
                total={items.length}
              />
            </>
          ) : (
            <></>
          ),
        horizontal: true
      }}
    />
  );
};
