import {Redirect, Route} from "react-router-dom";
import {isLogin} from "../utils/session";
import {GetParamValue} from "../utils/path";

const views = require("../views");

const RouterGuard = (props: any) => {
    const {routes, location} = props;
    const {pathname} = location

    if (pathname === "/") {
        return <Redirect to={"/device-management?locale=devices"}/>
    }

    const decodeLocation = () => {
        const locale = GetParamValue(location.search, "locale")
        if (locale) {
            const paths = locale.split("/")
            return paths[paths.length - 1]
        }
        return location.pathname
    }

    if (routes.length === 0) {
        return <Redirect to={"/403"}/>
    }

    const target = routes.find((item: any) => item.name === decodeLocation())
    console.log(target)
    if (target && views[target.view]) {
        const component = views[target.view]
        if (!target.isAuth) {
            return <Route exact path={target.path} key={target.name} component={component}/>
        }
        if (isLogin()) {
            return <Route exact path={target.path} key={target.name} component={component}/>
        } else {
            return <Redirect to="/login"/>
        }
    } else {
        return <Redirect to="/404"/>
    }
}

export default RouterGuard