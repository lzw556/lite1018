import {Device} from "./device";

export type Network = {
    id: number
    name: string
    gateway: Device
    routingTables: []
    nodes: Device[]
}