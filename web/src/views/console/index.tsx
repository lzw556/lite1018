import React, {useEffect} from "react";
import {store} from "../../store";
import {ConsoleRoutes} from "../../routers/routes";
import {ConsoleLayout} from "../layout";

const ConsolePage = (props: any) => {

    useEffect(() => {
        console.log("success")
        console.log(store.getState())
    })
    return <ConsoleLayout {...props} menus={ConsoleRoutes}/>
}

export default ConsolePage