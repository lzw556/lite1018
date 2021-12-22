import {Measurement} from "../../../../../types/measurement";
import {FC, useEffect, useState} from "react";
import {GetMeasurementDataRequest} from "../../../../../apis/measurement";
import moment from "moment";
import {Col, Row, DatePicker, Space} from "antd";
import MeasurementFieldSelect from "../../../../../components/select/measurementFieldSelect";
import Label from "../../../../../components/label";
import {MeasurementField} from "../../../../../types/measurement_data";
import {MeasurementType} from "../../../../../types/measurement_type";
import BoltLooseningChart from "./chart/boltLooseningChart";
import {EmptyLayout} from "../../../../layout";

export interface HistoryDataProps {
    measurement: Measurement;
}

const {RangePicker} = DatePicker;

const HistoryData:FC<HistoryDataProps> = ({measurement}) => {
    const [beginDate, setBeginDate] = useState(moment().subtract(7, 'days').startOf("day"));
    const [endDate, setEndDate] = useState(moment().endOf("day"));
    const [dataSource, setDataSource] = useState<any>({})
    const [field, setField] = useState<MeasurementField>()

    useEffect(() => {
        GetMeasurementDataRequest(measurement.id, beginDate.utc().unix(), endDate.utc().unix()).then(setDataSource);
    }, [beginDate, endDate])

    const renderChart = () => {
        if (field && dataSource) {
            switch (measurement.type) {
                case MeasurementType.BoltLoosening:
                    return <BoltLooseningChart dataSource={dataSource} field={field} style={{height: "400px"}}/>
            }
        }
        return <EmptyLayout description={"暂时没有数据"}/>
    }

    return <>
        <Row justify={"end"}>
            <Col>
                <Space>
                    <Label name={"属性"}>
                        <MeasurementFieldSelect placeholder={"请选择属性"} bordered={false} measurement={measurement} onChange={setField}/>
                    </Label>
                    <RangePicker
                        allowClear={false}
                        value={[beginDate, endDate]}
                        onChange={(date, dateString) => {
                            if (dateString) {
                                setBeginDate(moment(dateString[0]).startOf('day'))
                                setEndDate(moment(dateString[1]).endOf('day'))
                            }
                        }}/>
                </Space>
            </Col>
        </Row>
        <Row justify={"start"}>
            <Col span={24}>
                {
                    renderChart()
                }
            </Col>
        </Row>
    </>
}

export default HistoryData;