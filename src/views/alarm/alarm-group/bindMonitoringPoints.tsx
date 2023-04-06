import { Checkbox, Col, Empty, Form, Input, Modal, ModalProps, Row, Select, Spin } from 'antd';
import * as React from 'react';
import { getAssets } from '../../asset/services';
import { AssetRow } from '../../asset/types';
import { bindMeasurementsToAlarmRule2 } from './services';
import { AlarmRule } from './types';
import intl from 'react-intl-universal';
import { useAssetCategoryChain } from '../../../config/assetCategory.config';
import { MONITORING_POINT } from '../../monitoring-point';

type MixinAssetRow = AssetRow & { pointIds: number[]; checked: boolean; indeterminate: boolean };

export const BindMonitoringPoints: React.FC<
  ModalProps & { selectedRow: AlarmRule } & { onSuccess: () => void }
> = (props) => {
  const [form] = Form.useForm();
  const [assets, setAssets] = React.useState<MixinAssetRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [asset, setAsset] = React.useState<MixinAssetRow>();
  const { root } = useAssetCategoryChain();

  React.useEffect(() => {
    const filterValidPoints = ({ children }: AssetRow) =>
      children &&
      children.length > 0 &&
      children.some(
        ({ monitoringPoints }) =>
          monitoringPoints &&
          monitoringPoints.length > 0 &&
          monitoringPoints.some(({ type }) => type === props.selectedRow.type)
      );

    getAssets({ type: root.key, parent_id: 0 }).then((data) => {
      setLoading(false);
      const assets = data.filter(filterValidPoints).map((asset) => {
        const pointIds: number[] = [];
        if (asset.children && asset.children.length > 0) {
          asset.children.forEach((sub) => {
            if (sub.monitoringPoints && sub.monitoringPoints.length > 0)
              pointIds.push(...sub.monitoringPoints.map(({ id }) => id));
          });
        }
        const initialIds = (props.selectedRow.monitoringPoints || [])
          .map(({ id }) => id)
          .filter((id) => pointIds.includes(id));
        if (initialIds.length > 0)
          form.setFieldsValue({
            [`${asset.id}`]: { ids: initialIds }
          });
        return {
          ...asset,
          checked: pointIds.length === initialIds.length,
          indeterminate: (initialIds.length && initialIds.length < pointIds.length) || false,
          pointIds
        };
      });
      setAssets(assets);
    });
  }, [props.selectedRow, form, root.key]);

  React.useEffect(() => {
    if (assets.length > 0) {
      if (!asset) {
        setAsset(assets[0]);
      } else {
        setAsset(assets.find(({ id }) => id === asset.id));
      }
    }
  }, [assets, asset]);

  const updateAssets = (asset: MixinAssetRow, checked: boolean, indeterminate: boolean) => {
    setAssets((prev) =>
      prev.map((item) => {
        if (item.id === asset.id) {
          return {
            ...item,
            checked,
            indeterminate
          };
        } else {
          return item;
        }
      })
    );
  };

  const renderModalContent = () => {
    if (loading) return <Spin />;
    if (assets.length === 0 || !asset)
      return (
        <Empty description={intl.get('NO_DATA_PROMPT')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      );
    return (
      <>
        <Form.Item>
          <Input.Group>
            {asset && (
              <Checkbox
                key={asset.id}
                onChange={(e) => {
                  form.setFieldsValue({
                    [`${asset.id}`]: { ids: e.target.checked ? asset.pointIds : [] }
                  });
                  updateAssets(asset, e.target.checked, false);
                }}
                checked={asset.checked}
                indeterminate={asset.indeterminate}
              >
                {intl.get('SELECT_ALL')}
              </Checkbox>
            )}
            <Select
              onChange={(val) => setAsset(assets.find(({ id }) => id === val))}
              defaultValue={assets[0].id}
              style={{ width: '50%', marginLeft: '1em' }}
            >
              {assets.map(({ id, name }) => (
                <Select.Option value={id} key={id}>
                  {name}
                </Select.Option>
              ))}
            </Select>
          </Input.Group>
        </Form.Item>
        {assets.map(({ id, children }) => (
          <div key={id} style={{ display: asset.id === id ? 'block' : 'none' }}>
            <Form.Item name={[`${id}`, 'ids']}>
              <Checkbox.Group
                style={{ width: '100%' }}
                onChange={(e) => {
                  updateAssets(
                    asset,
                    asset.pointIds.length === e.length,
                    (e.length && e.length < asset.pointIds.length) || false
                  );
                }}
              >
                <Row key={id} gutter={[0, 16]} style={{ marginBottom: 16 }}>
                  {children &&
                    children
                      .filter(({ monitoringPoints }) =>
                        monitoringPoints?.some(({ type }) => type === props.selectedRow.type)
                      )
                      .map(({ id, name, monitoringPoints }) => (
                        <React.Fragment key={id}>
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
                        </React.Fragment>
                      ))}
                </Row>
              </Checkbox.Group>
            </Form.Item>
          </div>
        ))}
      </>
    );
  };

  return (
    <Modal
      width={800}
      title={intl.get('EDIT_SOMETHING', { something: intl.get(MONITORING_POINT) })}
      bodyStyle={{ maxHeight: 700, overflow: 'auto' }}
      {...props}
      okButtonProps={{ disabled: assets.length === 0 }}
      onOk={() => {
        form.validateFields().then((values) => {
          const monitoring_point_ids: number[] = [];
          Object.values(values)
            .filter((value: any) => value.ids !== undefined)
            .forEach(({ ids }: any) => monitoring_point_ids.push(...ids));
          if (monitoring_point_ids.length === 0) props.onSuccess();
          if (monitoring_point_ids) {
            bindMeasurementsToAlarmRule2(props.selectedRow.id, { monitoring_point_ids }).then(() =>
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
