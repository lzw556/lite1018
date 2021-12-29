import {
    AddAlarmRule,
    AddAlarmRuleTemplate,
    DeviceDetail,
    Login,
    NotFound,
    ServerError,
    Unauthorized,
} from "../views";
import {Menu} from "../types/menu";

const AppRoutes = [
    {
        path: "/login",
        name: "Login",
        component: Login,
        isAuth: false
    },
    {
        path: "/403",
        name: "403",
        component: Unauthorized,
        isAuth: false,
    },
    {
        path: "/404",
        name: "404",
        component: NotFound,
        isAuth: false
    },
    {
        path: "/500",
        name: "500",
        component: ServerError,
        isAuth: false,
    }
]

const SecondaryRoutes: Menu[] = [
    {
        id: 100,
        name: "deviceDetail",
        path: "/device-management",
        title: "设备详情",
        view: "DeviceDetail",
        icon: "",
        hidden: true,
        isAuth: true,
        children: [],
    },
    {
        id: 101,
        name: "addAlarmRule",
        path: "/alarm-management",
        title: "添加规则",
        view: "AddAlarmRule",
        icon: "",
        hidden: true,
        isAuth: true,
        children: [],
    },
    {
        id: 102,
        name: "addAlarmRuleTemplate",
        path: "/alarm-management",
        title: "添加规则模板",
        view: "AddAlarmRuleTemplate",
        icon: "",
        hidden: true,
        isAuth: true,
        children: [],
    },
    {
        id: 103,
        name: "editAlarmRuleTemplate",
        path: "/alarm-management",
        title: "编辑规则模板",
        view: "EditAlarmRuleTemplate",
        icon: "",
        hidden: true,
        isAuth: true,
        children: [],
    },
    {
        id: 104,
        name: "networkDetail",
        path: "/network-management",
        title: "网络详情",
        view: "NetworkDetail",
        icon: "",
        hidden: true,
        isAuth: true,
        children: [],
    },
    {
        id: 105,
        name: "measurementDetail",
        path: "/asset-management",
        title: "监测点详情",
        view: "MeasurementDetail",
        icon: "",
        hidden: true,
        isAuth: true,
        children: [],
    }
]

export {
    AppRoutes,
    SecondaryRoutes
}