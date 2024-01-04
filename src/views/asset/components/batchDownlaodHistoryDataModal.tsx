import { Button, Col, ModalProps, Row, Tree, message } from 'antd';
import React from 'react';
import intl from 'react-intl-universal';
import JSZip from 'jszip';
import { ModalWrapper } from '../../../components/modalWrapper';
import { getFilename } from '../../../utils/format';
import { AssetRow } from '../types';
import { mapTree, tree2List } from '../../../utils/tree';
import { combineMonitoringPointToAsset } from '../common/utils';
import { downloadHistory } from '../services';
import {
  RangeDatePicker,
  oneYearNumberRange,
  oneYearRange
} from '../../../components/rangeDatePicker';
import { MONITORING_POINT_DISPLAY_PROPERTIES } from '../../monitoring-point';
import { useLocaleContext } from '../../../localeProvider';

export const BatchDownlaodHistoryDataModal = ({
  assets,
  ...rest
}: { assets: AssetRow[] } & ModalProps) => {
  const [range, setRange] = React.useState<number[]>(oneYearNumberRange);
  const [selectedIds, setSelectedIds] = React.useState<[number, number][]>([]);
  const [loading, setLoading] = React.useState(false);
  const [loading2, setLoading2] = React.useState(false);
  const { language } = useLocaleContext();

  const getTreedata = (assets: AssetRow[]) => {
    if (assets.length > 0) {
      const mixedTree = mapTree(assets, (asset) => combineMonitoringPointToAsset(asset));
      return mapTree(mixedTree, (mix) => {
        return {
          ...mix,
          key: mix.type < 10000 ? `${mix.id}-${mix.type}` : `${mix.id}`
        };
      });
    }
  };

  const treeData = getTreedata(assets);

  const handleDownload = (ids: [number, number][]) => {
    const [from, to] = range;
    const fetchs = ids.map(([id, type]) =>
      downloadHistory(
        id,
        from,
        to,
        JSON.stringify(
          MONITORING_POINT_DISPLAY_PROPERTIES[
            type as keyof typeof MONITORING_POINT_DISPLAY_PROPERTIES
          ].map(({ key }) => key)
        ),
        language
      )
    );
    Promise.all(fetchs)
      .then((datas) => {
        if (ids.length <= 10) {
          datas.forEach((res, i) => {
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', getFilename(res, ids[i][0]));
            document.body.appendChild(link);
            link.click();
          });
        } else {
          const zip = new JSZip();
          datas.forEach((res, i) => {
            if (res.status === 200) {
              zip.file(getFilename(res, ids[i][0]), new Blob([res.data as any]));
            }
          });
          zip.generateAsync({ type: 'blob' }).then((content) => {
            const url = window.URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${intl.get('DATA')}.zip`);
            document.body.appendChild(link);
            link.click();
          });
        }
      })
      .catch(() => message.error(intl.get('FAILED_TO_GET_DATA')))
      .finally(() => {
        setLoading(false);
        setLoading2(false);
      });
  };

  return (
    <ModalWrapper
      title={intl.get('BATCH_DOWNLOAD')}
      {...rest}
      okButtonProps={{ disabled: selectedIds.length === 0 }}
      footer={[
        <Button key='cancel' onClick={(e) => rest.onCancel && rest.onCancel(e as any)}>
          {intl.get('CANCEL')}
        </Button>,
        <Button
          key='ok'
          onClick={() => {
            setLoading2(true);
            handleDownload(selectedIds);
          }}
          disabled={selectedIds.length === 0}
          loading={loading2}
        >
          {intl.get('OK')}
        </Button>,
        <Button
          key='all'
          type='primary'
          loading={loading}
          onClick={() => {
            const mixedTree = mapTree(assets, (asset) => combineMonitoringPointToAsset(asset));
            const list = tree2List(mixedTree);
            const points = list.filter((item) => item.type > 10000);
            if (points.length > 0) {
              setLoading(true);
              handleDownload(
                points
                  .map(({ id }) => `${id}`)
                  .map((id) => [Number(id.split('-')[0]), Number(id.split('-')[1])])
              );
            }
          }}
        >
          {intl.get('DOWNLOAD_ALL')}
        </Button>
      ]}
    >
      <Row gutter={[0, 16]}>
        <Col span={24}>
          <RangeDatePicker onChange={setRange} defaultRange={oneYearRange} />
        </Col>
        <Col span={24}>
          <Tree
            checkable={true}
            onCheck={(keys: any) => {
              if (keys && Array.isArray(keys) && keys.length > 0) {
                setSelectedIds(
                  keys
                    .filter((k) => Number(k.split('-')[1] > 10000))
                    .map((k) => [Number(k.split('-')[0]), Number(k.split('-')[1])])
                );
              } else {
                setSelectedIds([]);
              }
            }}
            treeData={treeData as any}
            fieldNames={{ key: 'key', title: 'name' }}
            defaultExpandAll={true}
            height={500}
          />
        </Col>
      </Row>
    </ModalWrapper>
  );
};
