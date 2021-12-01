import {DatePicker, Form, Modal, ModalProps, Select} from "antd";
import {FC, useEffect, useState} from "react";
import {DownloadDeviceDataRequest} from "../../../../../apis/device";
import moment from "moment";
import {Device} from "../../../../../types/device";

const {RangePicker} = DatePicker
const {Option} = Select

export interface DownloadModalProps extends ModalProps {
    device: Device
    property?: any
    onSuccess: () => void
}

const DownloadModal: FC<DownloadModalProps> = (props) => {
    const {visible, device, property, onSuccess} = props
    const [startDate, setStartDate] = useState<moment.Moment>(moment().startOf('day').subtract(7, 'd'))
    const [endDate, setEndDate] = useState<moment.Moment>(moment().endOf('day'))
    const [form] = Form.useForm()

    useEffect(() => {
        if (visible) {
            form.setFieldsValue({
                properties: property ? [property.id] : []
            })
        }
    }, [visible])

    const onDownload = () => {
        form.validateFields(["properties"]).then(values => {
            console.log(JSON.stringify(values.properties))
            DownloadDeviceDataRequest(device.id, JSON.stringify(values.properties), startDate.utc().unix(), endDate.utc().unix()).then(res => {
                if (res.status === 200) {
                    const url = window.URL.createObjectURL(new Blob([res.data]))
                    const link = document.createElement('a')
                    link.href = url
                    link.setAttribute('download', `${device.name}.xlsx`)
                    document.body.appendChild(link)
                    link.click()
                    onSuccess()
                }
            })
        })
    }

    return <Modal {...props} width={390} title={"数据下载"} okText={"下载"} onOk={onDownload} cancelText={"取消"}>
        <Form form={form}>
            <Form.Item label={"设备属性"} name={"properties"} required>
                <Select placeholder={"请选择设备属性"} mode={"multiple"} maxTagCount={2}>
                    {
                        device.properties.map(item => <Option key={item.id} value={item.id}>{item.name}</Option>)
                    }
                </Select>
            </Form.Item>
            <Form.Item label={"时间范围"} required>
                <RangePicker
                    allowClear={false}
                    style={{width: "252px"}}
                    value={[startDate, endDate]}
                    onChange={(_, dateString) => {
                        if (dateString) {
                            setStartDate(moment(dateString[0]).startOf('day'))
                            setEndDate(moment(dateString[1]).endOf('day'))
                        }
                    }}/>
            </Form.Item>
        </Form>
    </Modal>
}

export default DownloadModal