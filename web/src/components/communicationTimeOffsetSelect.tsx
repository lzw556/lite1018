import {FC} from "react";
import {Select, SelectProps} from "antd";
import {CaretDownOutlined} from "@ant-design/icons";

const {Option} = Select

interface CommunicationTimeOffsetSelectProps extends SelectProps<any> {
  offsets: {value:number, text:string}[]
}

const CommunicationTimeOffsetSelect:FC<CommunicationTimeOffsetSelectProps> = (props) => {
  const {offsets} = props;

  return <Select {...props} suffixIcon={<CaretDownOutlined />}>
      {
          offsets.map(item =>
              <Option key={item.value} value={item.value}>{item.text}</Option>
          )
      }
  </Select>
}

export default CommunicationTimeOffsetSelect