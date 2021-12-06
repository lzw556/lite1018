import request from "../utils/request";
import {GetResponse} from "../utils/response";

export function GetMeasurementParametersRequest(id:number) {
    return request.get(`/measurementTypes/${id}/parameters`).then(GetResponse);
}