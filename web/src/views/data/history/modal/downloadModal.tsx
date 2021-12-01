import {Cascader, DatePicker, Form, Modal, ModalProps} from "antd";
import {FC, useEffect, useState} from "react";
import {PagingAssetsRequest} from "../../../../apis/asset";
import {DownloadDeviceDataRequest, PagingDevicesRequest} from "../../../../apis/device";
import moment from "moment";
import {Device} from "../../../../types/device";

const {RangePicker} = DatePicker

export interface DownloadModalProps extends ModalProps {
    device?: Device
    property?: any
    onSuccess: () => void
}

const DownloadModal: FC<DownloadModalProps> = (props) => {
    const {visible, device, property, onSuccess} = props
    const [options, setOptions] = useState<any>()
    const [startDate, setStartDate] = useState<moment.Moment>(moment().startOf('day').subtract(7, 'd'))
    const [endDate, setEndDate] = useState<moment.Moment>(moment().endOf('day'))
    const [selectedDevice, setSelectedDevice] = useState<any>(device)
    const [selectedProperty, setSelectedProperty] = useState<any>(property)
    const [form] = Form.useForm()

    useEffect(() => {
        if (visible) {
            PagingAssetsRequest(1, 100).then(data => {
                setOptions(data.result.map(item => {
                    return {value: item.id, label: item.name, isLeaf: false}
                }))
                if (device) {
                    form.setFieldsValue({
                        properties: [device?.name, property?.name]
                    })
                }
            })
            setSelectedDevice(device)
            setSelectedProperty(property)
        }
    }, [visible])

    const onLoadData = (selectedOptions: any) => {
        if (selectedOptions.length === 1) {
            const target = selectedOptions[0]
            PagingDevicesRequest(target.value, 1, 100, {}).then(data => {
                target.children = data.result.filter(item => item.category === 3).map(item => {
                    return {
                        value: item.id, label: item.name, isLeaf: false, data: item,
                        children: item.properties.map(property => {
                            return {value: property.id, label: property.name, data: property}
                        })
                    }
                })
                setOptions([...options])
            })
        }
    }

    const onDownload = () => {
        if (selectedDevice && selectedProperty) {
            DownloadDeviceDataRequest(selectedDevice.id, selectedProperty.id, startDate.utc().unix(), endDate.utc().unix()).then(res => {
                if (res.status === 200) {
                    const url = window.URL.createObjectURL(new Blob([res.data]))
                    const link = document.createElement('a')
                    link.href = url
                    link.setAttribute('download', `${selectedDevice.name}-${selectedProperty.name}.xlsx`)
                    document.body.appendChild(link)
                    link.click()
                    onSuccess()
                }
            })
        }
    }

    return <Modal {...props} width={390} title={"数据下载"} okText={"下载"} onOk={onDownload} cancelText={"取消"}>
        <Form form={form}>
            <Form.Item label={"设备属性"} name={"properties"} required>
                <Cascader style={{width: "252px"}} placeholder={"请选择设备属性"} options={options} loadData={onLoadData}
                          onChange={(value: any, selectedOptions: any) => {
                              if (selectedOptions) {
                                  setSelectedDevice(selectedOptions[1].data)
                                  setSelectedProperty(selectedOptions[2].data)
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

export default DownloadModal