import * as React from 'react';
import { AssetRow } from '../assetList/props';
import { MeasurementRow } from '../summary/measurement/props';
import { AssetTypes } from './constants';

export function useActionBarStatus() {
  const [visible, setVisible] = React.useState(false);
  const [visibleAsset, setVisibleAsset] = React.useState(false);
  const [selectedMeasurement, setSelectedMeasurement] = React.useState<MeasurementRow>();
  const [selectedAsset, setSelectedAsset] = React.useState<AssetRow>();
  const [initialValues, setInitialValues] = React.useState<
    typeof AssetTypes.WindTurbind | undefined
  >(AssetTypes.WindTurbind);
  const [flangeId, setFlangeId] = React.useState<number | undefined>();

  const handleEdit = (
    selectedMeasurement?: MeasurementRow,
    selectedAsset?: AssetRow,
    initialValues?: typeof AssetTypes.WindTurbind,
    flangeId?: number
  ) => {
    if (selectedMeasurement) {
      setSelectedMeasurement(selectedMeasurement);
      setSelectedAsset(undefined);
      setInitialValues(undefined);
      setVisible(true);
      setVisibleAsset(false);
      setFlangeId(undefined);
    } else if (selectedAsset) {
      setSelectedAsset(selectedAsset);
      setSelectedMeasurement(undefined);
      setInitialValues(initialValues);
      setVisibleAsset(true);
      setVisible(false);
      setFlangeId(undefined);
    } else if (initialValues) {
      setSelectedMeasurement(undefined);
      setSelectedAsset(undefined);
      setInitialValues(initialValues);
      setVisibleAsset(true);
      setVisible(false);
      setFlangeId(undefined);
    } else if (flangeId) {
      setFlangeId(flangeId);
      setSelectedMeasurement(undefined);
      setSelectedAsset(undefined);
      setInitialValues(undefined);
      setVisible(true);
      setVisibleAsset(false);
    } else {
      setSelectedMeasurement(undefined);
      setSelectedAsset(undefined);
      setInitialValues(undefined);
      setVisible(true);
      setVisibleAsset(false);
      setFlangeId(undefined);
    }
  };

  return {
    visible,
    setVisible,
    visibleAsset,
    setVisibleAsset,
    selectedMeasurement,
    selectedAsset,
    initialValues,
    handleEdit,
    flangeId
  };
}
