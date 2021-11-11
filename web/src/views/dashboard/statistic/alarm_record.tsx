import ShadowCard from "../../../components/shadowCard";
import {Divider, List, Skeleton, Typography} from "antd";
import InfiniteScroll from "react-infinite-scroll-component";
import {useEffect, useState} from "react";
import {PagingAlarmRecordsRequest} from "../../../apis/alarm";
import moment from "moment";
import {GetFieldName} from "../../../constants/field";
import {OperationTranslate} from "../../../constants/rule";
import "../iconfont.css"
import {ColorDanger, ColorInfo, ColorWarn} from "../../../constants/color";

const {Title} = Typography;

const AlarmRecord = () => {
    const [height] = useState(window.innerHeight - 470);
    const [startDate] = useState(moment().local().startOf("day").subtract(7, 'd'))
    const [endDate] = useState(moment().local().endOf("day"))
    const [data, setData] = useState<any>([])
    const [total, setTotal] = useState<number>(0)
    const [current, setCurrent] = useState<number>(1)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const fetchAlarmRecords = (current: number) => {
        setIsLoading(true)
        PagingAlarmRecordsRequest(current, 10, startDate.utc().unix(), endDate.utc().unix(), {}).then(res => {
            setIsLoading(false)
            if (res.code === 200) {
                setData([...data, ...res.data.result])
                setTotal(res.data.total)
                setCurrent(res.data.page)
            }
        })
    }

    useEffect(() => {
        fetchAlarmRecords(1)
    }, [])

    return <ShadowCard style={{margin: 4}}>
        <Title level={4}>一周报警记录</Title>
        <div
            id="scrollableDiv"
            style={{
                height: height,
                overflow: 'auto',
                border: '0px solid rgba(140, 140, 140, 0.35)',
            }}
        >
            <InfiniteScroll
                dataLength={data.length}
                hasMore={data.length < total}
                loader={<Skeleton paragraph={{rows: 1}} active={isLoading}/>}
                endMessage={<Divider plain>没有更多报警记录了</Divider>}
                scrollableTarget="scrollableDiv"
                next={() => {
                    fetchAlarmRecords( current + 1)
                }}>
                <List size={"small"} dataSource={data}
                      renderItem={(record: any) => {
                          return <List.Item key={record.id}>
                             <List.Item.Meta
                                             title={`${moment.unix(record.timestamp).local().format("YYYY-MM-DD HH:mm:ss")}`}
                                             description={`设备【${record.device.name}】当前【${GetFieldName(record.rule.field)}】值为:
                                             ${record.value.toFixed(record.property.precision)}${record.property.unit}${OperationTranslate(record.rule.operation)}
                                             设定的阈值:${record.rule.threshold.toFixed(record.property.precision)}${record.property.unit}`}/>
                              {
                                  record.level === 3 && <div className={"iconfont icon-weiwangguanicon-defuben-"} style={{color: ColorDanger}}/>
                              }
                              {
                                  record.level === 2 && <div className={"iconfont icon-warning-filling"} style={{color: ColorWarn}}/>
                              }
                              {
                                  record.level === 1 && <div className={"iconfont icon-info"} style={{color: ColorInfo}}/>
                              }
                          </List.Item>
                      }}/>
            </InfiniteScroll>
        </div>
    </ShadowCard>
}

export default AlarmRecord