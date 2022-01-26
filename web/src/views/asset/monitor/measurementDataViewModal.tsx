import {Modal, ModalProps, Table, Tag, Typography} from "antd";
import {Measurement} from "../../../types/measurement";
import {FC, useEffect, useState} from "react";
import {MeasurementField} from "../../../types/measurement_data";
import moment from "moment";

export interface MeasurementDataViewModalProps extends ModalProps{
    measurement: Measurement
}

const MeasurementDataViewModal:FC<MeasurementDataViewModalProps> = (props) => {
    const {measurement, visible} = props;
    const [dataSource, setDataSource] = useState<MeasurementField[]>()

    useEffect(() => {
        if (visible) {
            setDataSource(measurement.data?.fields.sort((a, b) => a.sort - b.sort))
        }
    }, [visible])

    const columns = [
        {
            title: "名称",
            dataIndex: "title",
            key: "title",
        },
        {
            title: "值",
            dataIndex: "value",
            key: "value",
            render: (value: any, record:MeasurementField) => {
                if (Array.isArray(value)) {
                    return value.map(v => (<Tag>{`${v.toFixed(record.precision)}${record.unit}`}</Tag>))
                }
                return <Tag>{`${value.toFixed(record.precision)}${record.unit}`}</Tag>
            }
        }
    ]

    return <Modal {...props} width={620} title={measurement.name} footer={null}>
        {
            measurement.data && <Typography.Title level={4}>{`特征值采集时间: ${moment.unix(measurement.data.timestamp).local().format("YYYY-MM-DD hh:mm:ss")}`}</Typography.Title>
        }
        <Table columns={columns} size={"small"} scroll={{ y: 300 }} pagination={false} dataSource={dataSource}/>
    </Modal>
}

export default MeasurementDataViewModal;