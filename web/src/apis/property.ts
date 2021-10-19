import request from "../utils/request";
import {Property} from "../types/property";

export function GetPropertiesRequest(deviceType:number) {
    return request.get<Property[]>(`/properties?device_type=${deviceType}`).then(res => res.data)
}