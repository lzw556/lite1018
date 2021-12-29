import { Asset } from "./asset";
import {Display} from "./display";
import {MeasurementData} from "./measurement_data";
import {MeasurementType} from "./measurement_type";

export type Measurement = {
    id: number;
    name: string;
    type: number;
    display?: Display;
    data?: MeasurementData;
    alert?: { level: number };
    asset?: Asset;
    settings?: any;
    sensorSettings?:any;
    pollingPeriod:number;
    mode: number;
}

export namespace Measurement {
    export function getPrimaryFields(m: Measurement) {
        if (m.data) {
            switch (m.type) {
                case MeasurementType.BoltLoosening:
                    return m.data.fields?.filter(item => item.primary)
                case MeasurementType.BoltElongation:
                    return m.data.fields?.filter(item => item.primary)
                case MeasurementType.FlangeLoosening:
                    return m.data.fields?.filter(item => item.primary)
            }
        }
    }
}