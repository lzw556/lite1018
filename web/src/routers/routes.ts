import {
    AddAlarmRule, AddAlarmRuleTemplate,
    AddDevice, AlarmRecord, AlarmRule,
    Asset,
    Device, DeviceDetail, EditAlarmRuleTemplate,
    Firmware,
    HistoryData,
    ImportNetwork,
    Login,
    Me,
    Network,
    NotFound,
    ServerError, System,
    User
} from "../views";
import {
    AlertOutlined,
    AppstoreOutlined,
    ClusterOutlined,
    DashboardOutlined,
    FolderOutlined,
    LineChartOutlined, SettingOutlined,
    TeamOutlined,
    UserOutlined
} from "@ant-design/icons";

const AppRoutes = [
    {
        path: "/login",
        name: "Login",
        component: Login,
        auth: false
    },
    {
        path: "/404",
        name: "404",
        component: NotFound,
        auth: false
    },
    {
        path: "/500",
        name: "500",
        component: ServerError,
        auth: false,
    }
]

const auth = true

const ConsoleRoutes = [
    {
        name: "dashboard",
        path: "/dashboard",
        title: "监控大屏",
        hidden: false,
        auth: auth,
        icon: DashboardOutlined,
    },
    {
        name: "asset-management",
        path: "/asset-management",
        title: "资产管理",
        icon: FolderOutlined,
        hidden: false,
        auth: auth,
        children: [
            {
                name: "assets",
                path: "/asset-management/assets",
                title: "资产列表",
                component: Asset,
                hidden: false,
                auth: auth,
            },
        ],
    },
    {
        name: "device-management",
        path: "/device-management",
        title: "设备管理",
        icon: AppstoreOutlined,
        hidden: false,
        auth: auth,
        children: [
            {
                name: "devices",
                path: "/device-management/devices",
                title: "设备列表",
                component: Device,
                hidden: false,
                auth: auth,
                children: [
                    {
                        name: "deviceDetail",
                        path: "/device-management/devices",
                        title: "设备详情",
                        component: DeviceDetail,
                        hidden: true,
                        auth: auth,
                    }
                ]
            },
            {
                name: "add",
                path: "/device-management/add",
                title: "添加设备",
                component: AddDevice,
                hidden: false,
                auth: auth,
            },
            {
                name: "firmwares",
                path: "/device-management/firmwares",
                title: "固件列表",
                component: Firmware,
                hidden: false,
                auth: auth,
            }
        ]
    },
    {
        name: "network-management",
        path: "/network-management",
        title: "网络管理",
        icon: ClusterOutlined,
        hidden: false,
        auth: auth,
        children: [
            {
                name: "networks",
                path: "/network-management/networks",
                title: "网络列表",
                component: Network,
                hidden: false,
                auth: auth,
            },
            {
                name: "import",
                path: "/network-management/import",
                title: "导入网络",
                component: ImportNetwork,
                hidden: false,
                auth: auth
            }
        ]
    },
    {
        name: "data-management",
        path: "/data-management",
        title: "数据管理",
        icon: LineChartOutlined,
        auth: auth,
        children: [
            {
                name: "history",
                path: "/data-management/history",
                title: "历史数据",
                component: HistoryData,
                hidden: false,
                auth: auth
            }
        ]
    },
    {
        name: "alarm-management",
        path: "/alarm-management",
        title: "报警管理",
        icon: AlertOutlined,
        hidden: false,
        auth: auth,
        children: [
            {
                name: "alarmRecords",
                path: "/alarm-management/alarmRecords",
                title: "报警列表",
                component: AlarmRecord,
                hidden: false,
                auth: auth
            },
            {
                name: "alarmRules",
                path: "/alarm-management/alarmRules",
                title: "报警规则",
                component: AlarmRule,
                hidden: false,
                auth: auth,
                children: [
                    {
                        name: "addRule",
                        path: "/alarm-management/alarmRules",
                        title: "添加规则",
                        component: AddAlarmRule,
                        hidden: true,
                        auth: auth,
                    },
                    {
                        name: "addRuleTemplate",
                        path: "/alarm-management/alarmRules",
                        title: "创建规则模板",
                        component: AddAlarmRuleTemplate,
                        hidden: true,
                        auth: auth,
                    },
                    {
                        name: "editRuleTemplate",
                        path: "/alarm-management/alarmRules",
                        title: "编辑规则模板",
                        component: EditAlarmRuleTemplate,
                        hidden: true,
                        auth: auth,
                    }
                ]
            },
        ]
    },
    {
        name: "user-management",
        path: "/user-management",
        title: "用户管理",
        component: User,
        auth: auth,
        hidden: false,
        icon: TeamOutlined,
    },
    {
        name: "me",
        path: "/me",
        title: "个人中心",
        component: Me,
        auth: auth,
        hidden: false,
        icon: UserOutlined
    },
    {
        name: "system",
        path: "/system",
        title: "系统管理",
        component: System,
        auth: auth,
        hidden: false,
        icon: SettingOutlined,
    }
]

export {
    AppRoutes,
    ConsoleRoutes
}