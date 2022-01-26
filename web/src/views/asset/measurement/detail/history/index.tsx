import {Measurement} from "../../../../../types/measurement";
import {FC, useEffect, useState} from "react";
import {
    GetMeasurementDataRequest,
    RemoveMeasurementDataRequest
} from "../../../../../apis/measurement";
import moment from "moment";
import {Button, Col, DatePicker, Modal, Row, Space, Table} from "antd";
import MeasurementFieldSelect from "../../../../../components/select/measurementFieldSelect";
import Label from "../../../../../components/label";
import {MeasurementField} from "../../../../../types/measurement_data";
import {MeasurementType} from "../../../../../types/measurement_type";
import {EmptyLayout} from "../../../../layout";
import LineChart from "./chart/lineChart";
import {DeleteOutlined} from "@ant-design/icons";
import EChartsReact from "echarts-for-react";
import { DefaultHistoryDataOption, LineChartStyles } from "../../../../../constants/chart";

export interface HistoryDataProps {
    measurement: Measurement;
}

const {RangePicker} = DatePicker;

const HistoryData: FC<HistoryDataProps> = ({measurement}) => {
    const [beginDate, setBeginDate] = useState(moment().subtract(7, 'days').startOf("day"));
    const [endDate, setEndDate] = useState(moment().endOf("day"));
    const [dataSource, setDataSource] = useState<any>()
    const [field, setField] = useState<MeasurementField>()
    const [flangeElongation, setFlangeElongation] = useState(0)

    useEffect(() => {
        GetMeasurementDataRequest(measurement.id, beginDate.utc().unix(), endDate.utc().unix()).then(data => {
            console.log(data)
            setDataSource(data)
        });
    }, [beginDate, endDate])

    const renderFlangeElongationBolts = (number_of_bolts:number) => {
        let data = []
        for (let index = 1; index <= number_of_bolts; index++) {
            data.push({name:`第${index}个螺栓`,index:index-1})           
        }
        return <Table size={"middle"}
                    scroll={{y: 464}}
                    showHeader={false}
                    title={()=>`共 ${number_of_bolts} 个螺栓`}
                    columns={[
                        {
                            title: '',
                            dataIndex: 'name',
                            key: 'name'
                        }
                    ]}
                    dataSource={data}
                    loading={data === undefined}
                    pagination={false}
                    rowClassName={(record) => record.index === flangeElongation ? 'ant-table-row-selected' : ''}
                    onRow={(record) => ({
                        onClick: () => setFlangeElongation(record.index),
                        onMouseLeave: () => window.document.body.style.cursor = 'default',
                        onMouseEnter: () => window.document.body.style.cursor = 'pointer'
                    })}
                />
    }
    const renderFlangeElongationChart = (number_of_bolts:number)=> {
        if(field){
            const chartData = dataSource.map((data:any)=>({
                timestamp:data.timestamp,
                fields:data.fields.map((field:any)=> {
                    let value = 0
                    if(Array.isArray(field.value) && field.value.length === number_of_bolts){
                        value = field.value[flangeElongation]
                    }
                    return {...field, value}
                })
            }))
            const times = chartData.map((item:any) => moment.unix(item.timestamp).local());
            let legend: any[] = []
            let series = {}
            legend = [field.title]
            series =  [{
                ...LineChartStyles[0],
                name: field.title,
                type: "line",
                data: chartData.map((item:any) => item.fields.find((item:any) => item.name === field.name).value),
            }]
            return field && <EChartsReact style={{height: 500}} option={{
                ...DefaultHistoryDataOption,
                tooltip: {
                    trigger: 'axis',
                    formatter: function (params: any) {
                        let relVal = params[0].name;
                        for (let i = 0; i < params.length; i++) {
                            let value = Number(params[i].value).toFixed(3)
                            relVal += `<br/> ${params[i].marker} ${params[i].seriesName}: ${value}${field?.unit}`
                        }
                        return relVal;
                    }
                },
                series: series,
                legend: {data: legend},
                title: {text: field.title},
                xAxis:[{
                    type: 'category',
                    boundaryGap: false,
                    data: times.map((time:any) => time.format("YYYY-MM-DD HH:mm:ss"))
                }]
            }} notMerge={true}/>
        }
        
    }

    const renderFlangeElongationHistory = () => {
        const {settings:{number_of_bolts}} = measurement
        const length = Number(number_of_bolts) || 0
        if(length===0 || !dataSource || !field) return <EmptyLayout description={"暂时没有数据"}/>
        return <>
            <Col span={4}>{renderFlangeElongationBolts(length)}</Col>
            <Col span={20}>{renderFlangeElongationChart(length)}</Col></>
    }

    const renderChart = () => {
        if (field) {
            switch (measurement.type) {
                case MeasurementType.BoltLoosening:
                case MeasurementType.BoltElongation:
                case MeasurementType.AngleDip:
                case MeasurementType.Vibration:
                case MeasurementType.NormalTemperatureCorrosion:
                    return <Col span={24}><LineChart dataSource={dataSource} field={field} style={{height: "400px"}}/></Col>
                case MeasurementType.FlangeElongation:
                    return renderFlangeElongationHistory();
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
                                                defaultActiveFirstOption={true}
                                                value={field?.name}
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
            {
                renderChart()
            }
        </Row>
    </>
}

export default HistoryData;