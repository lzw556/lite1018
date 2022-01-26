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
    communicationTimeOffset: number
    groupSize: number
    groupInterval: number

}