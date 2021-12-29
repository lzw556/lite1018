import {Measurement} from "../../../../../types/measurement";
import {FC, useEffect, useState} from "react";
import {
    GetMeasurementDataRequest,
    GetMeasurementRawDataRequest,
    RemoveMeasurementDataRequest
} from "../../../../../apis/measurement";
import moment from "moment";
import {Button, Col, DatePicker, Modal, Row, Space} from "antd";
import MeasurementFieldSelect from "../../../../../components/select/measurementFieldSelect";
import Label from "../../../../../components/label";
import {MeasurementField} from "../../../../../types/measurement_data";
import {MeasurementType} from "../../../../../types/measurement_type";
import {EmptyLayout} from "../../../../layout";
import LineChart from "./chart/lineChart";
import {DeleteOutlined} from "@ant-design/icons";

export interface HistoryDataProps {
    measurement: Measurement;
}

const {RangePicker} = DatePicker;

const HistoryData: FC<HistoryDataProps> = ({measurement}) => {
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
                case MeasurementType.BoltElongation:
                case MeasurementType.AngleDip:
                case MeasurementType.Vibration:
                    return <LineChart dataSource={dataSource} field={field} style={{height: "400px"}}/>
            }
        }
        return <EmptyLayout description={"暂时没有数据"}/>
    }

    const onRemoveData = () => {
        Modal.confirm({
            title: "提示",
            content: `确定要删除监测点${measurement.name}从${beginDate.format("YYYY-MM-DD")}到${endDate.format("YYYY-MM-DD")}的数据吗？`,
            okText: "确定",
            cancelText: "取消",
            onOk: close => {
                RemoveMeasurementDataRequest(measurement.id, beginDate.unix(), endDate.unix()).then(_ => close())
            },
        })
    }

    return <>
        <Row justify={"end"}>
            <Col>
                <Space>
                    <Label name={"属性"}>
                        <MeasurementFieldSelect placeholder={"请选择属性"}
                                                style={{"width": "120px"}}
                                                bordered={false}
                                                measurement={measurement}
                                                onChange={setField}/>
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
                    <Button danger onClick={onRemoveData}><DeleteOutlined/></Button>
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