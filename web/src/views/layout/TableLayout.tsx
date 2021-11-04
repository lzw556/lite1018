import {Col, ConfigProvider, Empty, Pagination, Row, Table} from "antd";
import {useEffect, useState} from "react";

export interface TableProps {
    columns?: {}[]
    isLoading: boolean
    pagination: boolean
    refreshKey: number
    data: any
    emptyText?: string
    onChange?: (current: number, size: number) => void
}

export const DEFAULT_TABLE_PROPS: TableProps = {
    data: {},
    isLoading: false,
    pagination: true,
    refreshKey: 0
}

const TableLayout = (props: TableProps) => {
    const {columns, data, isLoading, onChange, pagination, refreshKey, emptyText} = props
    const [current, setCurrent] = useState<number>(1)
    const [size, setSize] = useState<number>(10)

    const onPageChange = (current: number) => {
        setCurrent(current)
    }

    const onPageSizeChange = (current: number, size: number) => {
        setSize(size)
    }

    useEffect(() => {
        if (onChange) {
            onChange(current, size)
        }
    }, [onChange, current, size, refreshKey])

    const renderEmpty = () => {
        return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyText}/>
    }

    return <ConfigProvider renderEmpty={renderEmpty}>
        <Row justify="center">
            <Col span={24}>
                <Table rowKey={(record: any) => record.id} size={"small"} columns={columns} dataSource={data.result} pagination={false}
                       loading={isLoading}/>
            </Col>
        </Row>
        <Row justify="center" style={{paddingTop: "10px"}}>
            <Col span={24} style={{textAlign: "right"}}>
                {
                    pagination ?
                        <Pagination current={current}
                                    pageSize={size}
                                    total={data.total}
                                    onShowSizeChange={onPageSizeChange}
                                    onChange={onPageChange}
                                    showSizeChanger/> : null
                }
            </Col>
        </Row>
    </ConfigProvider>
}

export default TableLayout