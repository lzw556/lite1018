import {Action} from "./index";
import {DeviceFilterForm} from "../../types/deviceFilterForm";
import {SET_DEVICE_FILTER} from "./types";

export function setDeviceFilterAction(data:any): Action<DeviceFilterForm> {
    return {
        type: SET_DEVICE_FILTER,
        payload: data
    }
}