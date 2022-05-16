import {Col, Divider, Form, message, Modal, Row, Select} from "antd";
import {FC, useEffect, useState} from "react";
import {Firmware} from "../../../types/firmware";
import {Device} from "../../../types/device";
import {GetDeviceFirmwaresRequest} from "../../../apis/firmware";
import moment from "moment/moment";
import {DeviceUpgradeRequest} from "../../../apis/device";
import {DeviceCommand} from "../../../types/device_command";

export interface UpgradeModalProps {
    visible: boolean
    device: Device
    onCancel?: () => void
    onSuccess: () => void
}

const {Option} = Select

const UpgradeModal: FC<UpgradeModalProps> = ({visible, device, onCancel, onSuccess}) => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [firmware, setFirmware] = useState<any>()
    const [firmwares, setFirmwares] = useState<Firmware[]>([])
    const [form] = Form.useForm()

    useEffect(() => {
        if (device && visible) {
            form.resetFields()
            setFirmware(undefined)
            GetDeviceFirmwaresRequest(device.id).then(setFirmwares)
        }
    }, [device, visible])

    const renderFirmware = () => {
        if (firmware) {
            return <>
                <Divider orientation={"left"} plain>固件信息</Divider>
                <Row justify={"start"}>
                    <Col span={4} style={{color: "#8a8e99"}}>
                        固件版本
                    </Col>
                    <Col span={6}>
                        {
                            firmware.version
                        }
                    </Col>
                    <Col span={4} style={{color: "#8a8e99"}}>
                        硬件版本
                    </Col>
                    <Col span={6}>
                        {
                            firmware.productId
                        }
                    </Col>
                </Row>
                <br/>
                <Row justify={"start"}>
                    <Col span={4} style={{color: "#8a8e99"}}>
                        编译时间
                    </Col>
                    <Col span={16}>
                        {
                            moment.unix(firmware.buildTime).local().format("YYYY-MM-DD HH:mm:ss")
                        }
                    </Col>
                </Row>
            </>
        }
    }

    const onUpgrade = () => {
        if (device) {
            setIsLoading(true)
            DeviceUpgradeRequest(device.id, {firmware_id: firmware.id, type: DeviceCommand.Upgrade}).then(res => {
                setIsLoading(false)
                if (res.code === 200) {
                    message.success("命令发送成功").then()
                    onSuccess()
                } else {
                    message.error("命令发送失败").then()
                }
            })
        }
    }

    return <Modal width={420} visible={visible} title={"设备升级"} okText={"升级"} onOk={onUpgrade} cancelText={"取消"}
                  onCancel={onCancel} confirmLoading={isLoading}>
        <Form form={form}>
            <Form.Item label={"选择固件版本"} name={"firmware"}>
                <Select placeholder={"请选择固件版本"}
                        onChange={value => {
                            setFirmware(firmwares.find(item => item.id === value))
                        }}>
                    {
                        firmwares.map(firmware => (
                            <Option key={firmware.id} value={firmware.id}>{firmware.version}</Option>))
                    }
                </Select>
            </Form.Item>
        </Form>
        {
            renderFirmware()
        }
    </Modal>
}

export default UpgradeModal