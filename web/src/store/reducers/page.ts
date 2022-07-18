import {State} from "./index";
import {PageForm} from "../../types/pageForm";
import {Action} from "../actions";
import {SET_PAGE} from "../actions/types";

export default function pageReducer(state: State<PageForm> = {data: {current: 1, size: 10}}, action:Action<PageForm>) {
    switch (action.type) {
        case SET_PAGE:
            return{
                ...state,
                data: action.payload,
            };
        default:
            return state;
    }
}