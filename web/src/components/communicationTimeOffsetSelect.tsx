import {FC} from "react";
import {Select, SelectProps} from "antd";
import {COMMUNICATION_TIME_OFFSET} from "../constants";
import {CaretDownOutlined} from "@ant-design/icons";

const {Option} = Select

const CommunicationTimeOffsetSelect:FC<SelectProps<any>> = (props) => {
  return <Select {...props} suffixIcon={<CaretDownOutlined />}>
      {
          COMMUNICATION_TIME_OFFSET.map(item =>
              <Option key={item.value} value={item.value}>{item.text}</Option>
          )
      }
  </Select>
}

export default CommunicationTimeOffsetSelect