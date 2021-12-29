import {Circle, Layer, Stage, Text} from "react-konva";
import {FC, useState} from "react";
import {Form, Input, message, Modal, Typography} from "antd";
import {CheckMacBindingRequest} from "../../apis/measurement";

export interface FlangeShapeProps {
    offset: number;
    size: number
    quantity: number;
    defaultValues?: any[]
    onOk: (value: string, index: number) => void;
}

const FlangeShape: FC<FlangeShapeProps> = ({quantity, defaultValues, offset, size, onOk}) => {
    const center = size / 2;
    const innerRadius = center - 60;
    const outerRadius = center - 10;
    const [visible, setVisible] = useState<boolean>(false)
    const [index, setIndex] = useState<number>(0)
    const [form] = Form.useForm()

    const onSave = () => {
        form.validateFields(["mac"]).then(values => {
            console.log(defaultValues)
            const device = defaultValues?.find(item => item.value === values.mac)
            if (device && device.index !== index) {
                message.error("请勿重复绑定")
            } else {
                setVisible(false)
                onOk(values.mac, index)
            }
        })
    }

    const renderBolts = () => {
        const bolts = [];
        const angel = 360 / quantity;
        for (let i = 0; i < quantity; i++) {
            const device = defaultValues?.find((value: any) => value.index === i)
            bolts.push(
                <Circle
                    key={i}
                    x={center + (innerRadius + outerRadius) / 2 * Math.cos((angel * i + offset) * Math.PI / -180)}
                    y={center + (innerRadius + outerRadius) / 2 * Math.sin((angel * i + offset) * Math.PI / -180)}
                    radius={10}
                    stroke={device ? "green" : "black"}
                    fill={device ? "green" : "white"}
                    onMouseOver={() => {
                        document.body.style.cursor = 'pointer'
                    }}
                    onMouseLeave={() => {
                        document.body.style.cursor = 'default'
                    }}
                    onClick={() => {
                        form.setFieldsValue({mac: device?.value})
                        setIndex(i)
                        setVisible(true)
                    }}
                />
            );
        }
        return bolts;
    }

    const onCheckMadBinding = (rule: any, value: any) => {
        return new Promise((resolve, reject) => {
            if (!value) {
                reject("请输入MAC地址")
            }
            if (value.length !== 12) {
                reject("请输入正确的MAC地址")
                return
            }
            CheckMacBindingRequest(value).then(
                resolve
            ).catch(e => {
                reject(e)
            })
        })
    }

    return <div>
        <Stage width={size} height={size}>
            <Layer>
                <Circle x={center} y={center} radius={outerRadius} fill={"white"} stroke={"gray"} dash={[3]}/>
                <Circle x={center} y={center} radius={innerRadius} fill={"white"} stroke={"gray"} dash={[3]}/>
                {
                    renderBolts()
                }
                {
                    defaultValues && <Text x={center - 50} y={center} width={100} fontSize={12}
                                           text={`已绑定${defaultValues.length}个设备`}/>
                }
            </Layer>
        </Stage>
        <Modal width={420} title={"设备绑定"} visible={visible} cancelText={"取消"} okText={"绑定"}
               onCancel={() => setVisible(false)} onOk={onSave}>
            <Form form={form} labelCol={{span: 6}}>
                <Form.Item label={"螺栓编号"}>
                    <Typography.Text>{`第${index + 1}个螺栓`}</Typography.Text>
                </Form.Item>
                <Form.Item label={"MAC地址"} name={"mac"} required rules={[{validator: onCheckMadBinding}]}>
                    <Input placeholder={"请输入设备MAC地址"}/>
                </Form.Item>
            </Form>
        </Modal>
    </div>
}

export default FlangeShape