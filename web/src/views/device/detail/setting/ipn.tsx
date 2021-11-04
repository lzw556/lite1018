import {Card, Col, Input, Row, Select} from "antd";
import {FC, useState} from "react";
import {DEFAULT_DEVICE_SETTING_IPN} from "../../../../types/device_setting";
import {Device} from "../../../../types/device";
import Setting from "./setting";
import "../../index.css"

export interface IPNSettingProps {
    device: Device
    values?: any
}

const {Option} = Select

const IPNSetting: FC<IPNSettingProps> = ({values, device}) => {
    const [ipn, setIPN] = useState<any>(values ? values : DEFAULT_DEVICE_SETTING_IPN)

    const onRefreshSetting = (setting:any) => {
        setIPN(Object.assign({}, values, setting))
    }

    return <Card bordered={false} size={"small"}>
        <Row justify={"start"}>
            <Col span={9}>
                <Setting device={device} name={"ip_mode"} title={"IP模式"} value={ipn.ip_mode} description={"建议设为DHCP模式,如果设为静态模式则需要同时配置IP地址,子网掩码和网关地址"} renderValue={item => {
                    return item ? "静态" : "DHCP"
                }} editable={true} renderEdit={item => {
                    return <Select defaultValue={item.ip_mode} size={"small"} onChange={v => {
                        item.ip_mode = v
                    }}>
                        <Option key={0} value={0}>DHCP</Option>
                        <Option key={1} value={1}>静态</Option>
                    </Select>
                }} onSuccess={onRefreshSetting}/>
            </Col>
            <Col span={9}>
                <Setting device={device} name={"ip_addr"} title={"IP地址"} value={ipn.ip_addr} editable={ipn.ip_mode === 1} renderEdit={item => {
                    return <Input size={"small"} defaultValue={item.ip_addr} onChange={e => {
                        item.ip_addr = e.target.value
                    }}/>
                }} onSuccess={onRefreshSetting}/>
            </Col>
        </Row>
        <Row justify={"start"}>
            <Col span={9}>
                <Setting device={device} value={ipn.subnet_mask} name={"subnet_mask"} title={"子网掩码"} editable={ipn.ip_mode === 1} renderEdit={item => {
                    return <Input size={"small"} defaultValue={item.subnet_mask} onChange={e => {
                        item.subnet_mask = e.target.value
                    }}/>
                }} onSuccess={onRefreshSetting}/>
            </Col>
            <Col span={9}>
                <Setting device={device} value={ipn.gateway_addr} name={"gateway_addr"} title={"网关地址"} editable={ipn.ip_mode === 1} renderEdit={item => {
                    return <Input size={"small"} defaultValue={item.gateway_addr} onChange={e => {
                        item.gateway_addr = e.target.value
                    }}/>
                }} onSuccess={onRefreshSetting}/>
            </Col>
        </Row>
        <Row justify={"start"}>
            <Col span={9}>
                <Setting device={device} value={ipn.ntp_is_enabled} name={"ntp_is_enabled"} title={"NTP是否启用"} editable={true} renderValue={(item => {
                    return item ? "启用" : "禁用"
                })} renderEdit={item => {
                    return <Select defaultValue={ipn.ntp_is_enabled ? 1 : 0} size={"small"} onChange={value => {
                        item.ntp_is_enabled = value === 1
                    }}>
                        <Option key={1} value={1}>启用</Option>
                        <Option key={0} value={0}>禁用</Option>
                    </Select>
                }} onSuccess={onRefreshSetting} description={"建议当网关处于局域网时禁用,如果启用则需要配置NTP地址"}/>
            </Col>
            <Col span={9}>
                <Setting device={device} value={ipn.ntp_addr} name={"ntp_addr"} title={"NTP地址"} editable={ipn.ntp_is_enabled} renderEdit={item => {
                    return <Input size={"small"} defaultValue={item.ntp_addr} onChange={e => {
                        item.ntp_addr = e.target.value
                    }}/>
                }} onSuccess={onRefreshSetting} description={"网关进行时间同步的地址,默认地址: ntp1.aliyun.com"}/>
            </Col>
        </Row>
    </Card>
}

export default IPNSetting