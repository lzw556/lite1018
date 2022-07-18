import {Action} from "./index";
import {PageForm} from "../../types/pageForm";
import {SET_PAGE} from "./types";

export function setPageAction(data:any): Action<PageForm> {
    return {
        type: SET_PAGE,
        payload: data,
    }
}