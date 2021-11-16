import React from "react";
import {ConsoleRoutes} from "../../routers/routes";
import {ConsoleLayout} from "../layout";

const ConsolePage = (props: any) => {
    return <ConsoleLayout {...props} menus={ConsoleRoutes}/>
}

export default ConsolePage