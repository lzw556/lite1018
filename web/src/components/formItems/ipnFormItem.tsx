import {Form, Input, Radio} from "antd";
import {FC, useState} from "react";
import {IpnSetting} from "../../types/ipn_setting";

export const IPNSettingKeys = ["ip_mode", "ip_addr", "subnet_mask", "gateway_addr", "ntp_is_enabled", "ntp_addr"]

export interface IpnFromItemProps {
    ipn?: IpnSetting
}

const IpnFormItem:FC<IpnFromItemProps> = ({ipn}) => {
    const [isDhcpEnabled, setIsDhcpEnabled] = useState<boolean>(ipn !== undefined && ipn.ip_mode === 0)
    const [isNtpEnabled, setIsNtpEnabled] = useState<boolean>(ipn !== undefined && ipn.ntp_is_enabled)

    const renderIPFormItem = () => {
        if (!isDhcpEnabled) {
            return <div>
                <Form.Item label={"IP地址"} name={["ipn", "ip_addr"]} initialValue={ipn?.ip_addr}
                           rules={[{required: true, message: "请输入IP地址"}]}>
                    <Input placeholder={"请输入网关IP地址"}/>
                </Form.Item>
                <Form.Item label={"子网掩码"} name={["ipn", "subnet_mask"]} initialValue={ipn?.subnet_mask}
                           rules={[{required: true, message: "请输入子网掩码"}]}>
                    <Input placeholder={"请输入网关子网掩码"}/>
                </Form.Item>
                <Form.Item label={"网关地址"} name={["ipn", "gateway_addr"]} initialValue={ipn?.gateway_addr}
                           rules={[{required: true, message: "请输入网关地址"}]}>
                    <Input placeholder={"请输入网关地址"}/>
                </Form.Item>
            </div>
        }
    }

    const renderNTPFormItem = () => {
        if (isNtpEnabled) {
            return <Form.Item label={"NTP地址"} initialValue={ipn?.ntp_addr} name={["ipn", "ntp_addr"]}
                              rules={[{required: true, message: "请输入NTP服务器地址"}]}>
                <Input placeholder={"请输入NTP服务器地址"}/>
            </Form.Item>
        }
    }

    return <div>
        <Form.Item label={"IP模式"} required name={["ipn", "ip_mode"]} initialValue={ipn?.ip_mode}>
            <Radio.Group buttonStyle={"solid"} onChange={(e) => {
                setIsDhcpEnabled(e.target.value === 0)
            }
            }>
                <Radio.Button key={0} value={0}>DHCP</Radio.Button>
                <Radio.Button key={1} value={1}>静态</Radio.Button>
            </Radio.Group>
        </Form.Item>
        {
            renderIPFormItem()
        }
        <Form.Item label={"是否启用NTP"} required name={["ipn", "ntp_is_enabled"]} initialValue={ipn?.ntp_is_enabled}>
            <Radio.Group buttonStyle={"solid"}  onChange={(e) => {
                setIsNtpEnabled(e.target.value)
            }
            }>
                <Radio.Button key={0} value={false}>禁用</Radio.Button>
                <Radio.Button key={1} value={true}>启用</Radio.Button>
            </Radio.Group>
        </Form.Item>
        {
            renderNTPFormItem()
        }
    </div>
}

export default IpnFormItem