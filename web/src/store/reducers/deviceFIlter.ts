import {State} from "./index";
import {DeviceFilterForm} from "../../types/deviceFilterForm";
import {Action} from "../actions";
import {SET_DEVICE_FILTER} from "../actions/types";

export default function deviceFilterReducer(state: State<DeviceFilterForm> = {data: {networkId: 0}}, action: Action<DeviceFilterForm>) {
    switch (action.type) {
        case SET_DEVICE_FILTER:
            return {
                ...state,
                data: action.payload
            };
        default:
            return state;
    }
}