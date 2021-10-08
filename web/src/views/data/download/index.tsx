import {Button, Cascader, Form, Modal, Space, DatePicker} from "antd";
import {FC, useState} from "react";
import {PagingAssetsRequest} from "../../../apis/asset";
import {DownloadDeviceDataRequest, PagingDevicesRequest} from "../../../apis/device";
import moment from "moment";
import {Device} from "../../../types/device";

const {RangePicker} = DatePicker

export interface DownloadDataProps {
    visible: boolean
    onCancel?: () => void
    onSuccess:() => void
}

const DownloadDataModal: FC<DownloadDataProps> = ({visible, onCancel, onSuccess}) => {
    const [options, setOptions] = useState<any>()
    const [startDate, setStartDate] = useState<moment.Moment>(moment().startOf('day').subtract(7, 'd'))
    const [endDate, setEndDate] = useState<moment.Moment>(moment().endOf('day'))
    const [selectedDevice, setSelectedDevice] = useState<Device>()
    const [selectedProperty, setSelectedProperty] = useState<any>()

    const onLoadAsset = (open: boolean) => {
        if (open) {
            PagingAssetsRequest(1, 100).then(res => {
                if (res.code === 200) {
                    setOptions(res.data.result.map(item => {
                        return {value: item.id, label: item.name, isLeaf: false}
                    }))
                }
            })
        }
    }

    const onLoadData = (selectedOptions: any) => {
        const target = selectedOptions[selectedOptions.length - 1]
        PagingDevicesRequest(target.value, 1, 100, {}).then(res => {
            if (res.code === 200) {
                target.children = res.data.result.filter(item => item.category === 3).map(item => {
                    return {
                        value: item.id, label: item.name, isLeaf: false, data: item,
                        children: item.properties.map(property => {
                            return {value: property.id, label: property.name, data: property}
                        })
                    }
                })
                setOptions([...options])
            }
        })
    }

    const onChange = (values:any, selectedOptions:any) => {
        setSelectedDevice(selectedOptions[1].data)
        setSelectedProperty(selectedOptions[2].data)
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

    return <Modal width={390} visible={visible} title={"数据下载"} okText={"下载"} onOk={onDownload} cancelText={"取消"}
                  onCancel={onCancel}>
            <Form.Item label={"设备属性"} required>
                <Cascader style={{width: "252px"}} placeholder={"请选择设备属性"} options={options} onPopupVisibleChange={onLoadAsset} loadData={onLoadData} onChange={onChange}/>
            </Form.Item>
            <Form.Item label={"时间范围"} required>
                <RangePicker
                    style={{width:"252px"}}
                    value={[startDate, endDate]}
                    onChange={(date, dateString) => {
                        if (dateString) {
                            setStartDate(moment(dateString[0]).startOf('day'))
                            setEndDate(moment(dateString[1]).endOf('day'))
                        }
                    }}/>
            </Form.Item>
    </Modal>
}

export default DownloadDataModal