import {DeviceType} from "./device_type";
import {WsnSetting} from "./wsn_setting";
import {Property} from "./property";

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
    state?: any
    upgradeState?:any
    alertState:number
    accessState: number
    information?:any
    category: number
    properties: Property[]
}