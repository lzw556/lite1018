import {Asset} from "../../../types/asset";
import {FC, useEffect, useState} from "react";
import {GetAlarmRecordStatisticsRequest} from "../../../apis/alarm";
import moment from "moment";
import {Col, Row, Statistic} from "antd";
import {AlarmRecordStatistics} from "../../../types/alarm_statistics";

export interface AlarmRecordStatisticProps {
    asset?: Asset
    style?: React.CSSProperties
}

const AlarmRecordStatistic:FC<AlarmRecordStatisticProps> = ({asset, style}) => {
    const [statistics, setStatistics] = useState<AlarmRecordStatistics>();

    useEffect(() => {
        if (asset) {
            const from = moment().startOf("d").unix()
            const to = moment().endOf("d").unix()
            GetAlarmRecordStatisticsRequest(from, to, {asset_id: asset.id}).then(setStatistics)
        }
    }, [asset])

    return <Row justify={"space-between"} style={style} align={"middle"}>
        <Col span={6}>
            <Statistic title={"未处理"} value={statistics?.untreated.reduce((acc, curr) => acc + curr, 0)}/>
        </Col>
        <Col span={6}>
            <Statistic title={"紧急"} value={statistics?.critical.reduce((acc, curr) => acc + curr, 0)}/>
        </Col>
        <Col span={6}>
            <Statistic title={"重要"} value={statistics?.warn.reduce((acc, curr) => acc + curr, 0)} />
        </Col>
        <Col span={6}>
            <Statistic title={"提示"} value={statistics?.info.reduce((acc, curr) => acc + curr, 0)} />
        </Col>
    </Row>
}

export default AlarmRecordStatistic;