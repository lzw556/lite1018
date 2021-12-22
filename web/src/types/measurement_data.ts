export type MeasurementData = {
    timestamp: number;
    fields: MeasurementField[]
}

export type MeasurementField = {
    name: string;
    title: string;
    unit: string;
    value: any;
    type: MeasurementFieldType;
    precision: number;
    primary: boolean;
}

export enum MeasurementFieldType {
    Float = 1,
    Array,
}