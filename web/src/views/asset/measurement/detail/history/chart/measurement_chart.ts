import {MeasurementField} from "../../../../../../types/measurement_data";
import React from "react";


export interface MeasurementChartProps {
    style?: React.CSSProperties;
    dataSource?: any
    field: MeasurementField
}