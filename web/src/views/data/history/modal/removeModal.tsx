import {Cascader, DatePicker, Form, Modal, ModalProps} from "antd";
import moment from "moment";
import {FC, useEffect, useState} from "react";
import {Device} from "../../../../types/device";
import {PagingAssetsRequest} from "../../../../apis/asset";
import {PagingDevicesRequest, RemoveDeviceDataRequest} from "../../../../apis/device";

const {RangePicker} = DatePicker

export interface RemoveModalProps extends ModalProps {
    device?: Device
    onSuccess: () => void
}

const RemoveModal: FC<RemoveModalProps> = (props) => {
    const {device, visible, onSuccess} = props
    const [options, setOptions] = useState<any>()
    const [startDate, setStartDate] = useState<moment.Moment>(moment().startOf('day').subtract(7, 'd'))
    const [endDate, setEndDate] = useState<moment.Moment>(moment().endOf('day'))
    const [selectedDevice, setSelectedDevice] = useState<any>(device)
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            PagingAssetsRequest(1, 100).then(data => {
                setOptions(data.result.map(item => {
                    return {value: item.id, label: item.name, isLeaf: false}
                }))
                form.setFieldsValue({
                    device: [device?.name]
                })
            })
            setSelectedDevice(device)
        }
    }, [visible])

    const onLoadData = (selectedOptions: any) => {
        const target = selectedOptions[selectedOptions.length - 1]
        PagingDevicesRequest(target.value, 1, 100, {}).then(data => {
            target.children = data.result.filter(item => item.category === 3).map(item => {
                return {
                    value: item.id, label: item.name, isLeaf: true, data: item,
                }
            })
            setOptions([...options])
        })
    }

    const onDelete = () => {
        RemoveDeviceDataRequest(selectedDevice.id, startDate.utc().unix(), endDate.utc().unix()).then(_ => onSuccess)
    }

    return <Modal {...props} width={390} title={"数据清空"} okText={"清空"} onOk={onDelete} cancelText={"取消"}>
        <Form form={form} labelCol={{span: 6}} labelAlign={"right"}>
            <Form.Item label={"设备"} name={"device"} required>
                <Cascader style={{width: "252px"}} placeholder={"请选择设备"} options={options} loadData={onLoadData}
                          onChange={(value: any, selectedOptions: any) => {
                              if (selectedOptions) {
                                  setSelectedDevice(selectedOptions[1].data)
                              }
                          }}/>
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

export default RemoveModal