import React from 'react';
import { Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import { ModalFormProps } from '../../types/common';
import { AssetRow } from '../asset-common';
import { area, CreateAsset, isAssetAreaParent, isAssetValidParent } from '../asset-variant';
import { useAssetCategories } from './utils';
import { Create } from './create';

export const ActionBar = ({
  asset,
  onSuccess,
  short = false
}: {
  asset?: AssetRow;
  onSuccess: () => void;
  short?: boolean;
}) => {
  const [open, setOpen] = React.useState(false);

  //only used to open difference modal
  const [type, setType] = React.useState<number | undefined>();

  const assetCategories = useAssetCategories();

  const commonProps: ModalFormProps = {
    onSuccess: () => {
      onSuccess();
      reset();
    },
    open,
    onCancel: () => {
      reset();
    }
  };

  const reset = () => {
    setOpen(false);
    setType(undefined);
  };

  const renderAreaCreateBtn = () => {
    const { label } = area;

    if (!asset || isAssetAreaParent(asset)) {
      return (
        <>
          <Button
            key={type}
            onClick={() => {
              setOpen(true);
              setType(1);
            }}
            type='primary'
          >
            {intl.get('CREATE_SOMETHING', { something: intl.get(label) })}
            <PlusOutlined />
          </Button>
          {type === 1 && <Create {...commonProps} parentId={asset?.id} />}
        </>
      );
    }
  };

  const renderAssetCreationBtn = () => {
    if (!asset || isAssetValidParent(asset)) {
      return (
        <>
          <Button
            key={2}
            onClick={() => {
              setOpen(true);
              setType(2);
            }}
            type='primary'
          >
            {intl.get('CREATE_SOMETHING', { something: intl.get('ASSET') })}
            <PlusOutlined />
          </Button>
          {type === 2 && (
            <CreateAsset {...commonProps} parentId={asset?.id} types={assetCategories} />
          )}
        </>
      );
    }
  };

  return (
    <Space>
      {renderAreaCreateBtn()}
      {!short && <>{renderAssetCreationBtn()}</>}
    </Space>
  );
};
