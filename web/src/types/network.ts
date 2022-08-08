import {Device} from "./device";
import {Asset} from "./asset";

export type Network = {
    id: number
    name: string
    gateway: Device
    asset: Asset
    routingTables: []
    nodes: Device[]
    communicationPeriod: number
    communicationPeriod2: number
    communicationOffset: number
    groupSize: number
    mode: number
}

export enum NetworkProvisioningMode {
    Mode1 = 1,
    Mode2
}

export namespace NetworkProvisioningMode {
   export function toString(mode:NetworkProvisioningMode) {
        switch (mode) {
            case NetworkProvisioningMode.Mode2:
                return "组网模式2"
            default:
                return "组网模式1"
        }
    }
}