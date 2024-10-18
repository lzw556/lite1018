import React from 'react';
import { AssetRow, getDataOfMonitoringPoint, HistoryData, Points } from '../../asset-common';

export function useHistoryDatas(asset?: AssetRow, range?: [number, number]) {
  const [historyDatas, setHistoryDatas] = React.useState<
    { name: string; data: HistoryData; height?: number; radius?: number }[] | undefined
  >();
  React.useEffect(() => {
    const points = Points.filter(asset?.monitoringPoints);
    if (points.length > 0 && range) {
      const [from, to] = range;
      const fetchs = points.map(({ id }) => getDataOfMonitoringPoint(id, from, to));
      Promise.all(fetchs).then((datas) =>
        setHistoryDatas(
          datas.map((data, index) => ({
            name: points[index].name,
            data,
            height: points[index].attributes?.tower_install_height,
            radius: points[index].attributes?.tower_base_radius
          }))
        )
      );
    }
  }, [asset, range]);
  return historyDatas;
}
