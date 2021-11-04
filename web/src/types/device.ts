import {DeviceType} from "./device_type";
import {WsnSetting} from "./wsn_setting";

export type Device = {
    id: number
    name: string
    macAddress: string
    typeId: DeviceType
    asset: { id: number, name: string }
    ipn: Map<string, any>
    system: Map<string, any>
    sensors: Map<string, any>
    wsn?: WsnSetting
    status?: any
    upgradeState?:any
    information?:any
    category: number
    properties: { id: number, name: string }[]
}