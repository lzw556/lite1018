import {Select, SelectProps} from "antd";
import {Measurement} from "../../types/measurement";
import {FC, useEffect, useState} from "react";
import {GetMeasurementFieldsRequest} from "../../apis/measurement";
import {MeasurementField} from "../../types/measurement_data";
import {CaretDownOutlined} from "@ant-design/icons";

export interface MeasurementFieldSelectProps extends SelectProps<any>{
  measurement: Measurement;
  onChange?: (value?: MeasurementField) => void;
}

const {Option} = Select;

const MeasurementFieldSelect:FC<MeasurementFieldSelectProps> = (props) => {
    const {measurement, onChange} = props
    const [fields, setFields] = useState<MeasurementField[]>([])

    useEffect(() => {
        GetMeasurementFieldsRequest(measurement.type).then(data => {
            setFields(data.sort((a, b) => a.sort - b.sort))
        })
    },[measurement])

    return <Select {...props} suffixIcon={<CaretDownOutlined/>} onChange={value => {
        if(onChange) onChange(fields.find(field => field.name === value))
    }}>
        {
            fields.map(field => (<Option key={field.name} value={field.name}>{field.title}</Option>))
        }
    </Select>
}

export default MeasurementFieldSelect;