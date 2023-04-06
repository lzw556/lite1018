import { Col, Divider, Form, message, Modal, Row, Select } from 'antd';
import { FC, useEffect, useState } from 'react';
import { Firmware } from '../../../types/firmware';
import { Device } from '../../../types/device';
import { GetDeviceFirmwaresRequest } from '../../../apis/firmware';
import dayjs from '../../../utils/dayjsUtils';
import { DeviceUpgradeRequest } from '../../../apis/device';
import { DeviceCommand } from '../../../types/device_command';
import intl from 'react-intl-universal';

export interface UpgradeModalProps {
  open: boolean;
  device: Device;
  onCancel?: () => void;
  onSuccess: () => void;
}

const { Option } = Select;

const UpgradeModal: FC<UpgradeModalProps> = ({ open, device, onCancel, onSuccess }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [firmware, setFirmware] = useState<any>();
  const [firmwares, setFirmwares] = useState<Firmware[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    if (device && open) {
      form.resetFields();
      setFirmware(undefined);
      GetDeviceFirmwaresRequest(device.id).then(setFirmwares);
    }
  }, [device, open, form]);

  const renderFirmware = () => {
    if (firmware) {
      return (
        <>
          <Divider orientation={'left'} plain>
            {intl.get('FIRMWARE_INFO')}
          </Divider>
          <Row justify={'start'}>
            <Col span={4} style={{ color: '#8a8e99' }}>
              {intl.get('FIRMWARE_VERSION')}
            </Col>
            <Col span={6}>{firmware.version}</Col>
            <Col span={4} style={{ color: '#8a8e99' }}>
              {intl.get('HARDWARE_VERSION')}
            </Col>
            <Col span={6}>{firmware.productId}</Col>
          </Row>
          <br />
          <Row justify={'start'}>
            <Col span={4} style={{ color: '#8a8e99' }}>
              {intl.get('BUILD_DATE')}
            </Col>
            <Col span={16}>
              {dayjs.unix(firmware.buildTime).local().format('YYYY-MM-DD HH:mm:ss')}
            </Col>
          </Row>
        </>
      );
    }
  };

  const onUpgrade = () => {
    if (firmware === undefined) {
      message.success(intl.get('PLEASE_SELECT_FIRMWARE'));
      return;
    }
    if (device) {
      setIsLoading(true);
      DeviceUpgradeRequest(device.id, {
        firmware_id: firmware.id,
        type: DeviceCommand.Upgrade
      }).then((res) => {
        setIsLoading(false);
        if (res.code === 200) {
          message.success(intl.get('COMMAND_SENT_SUCCESSFUL')).then();
          onSuccess();
        } else {
          message.error(intl.get('FAILED_TO_SEND_COMMAND')).then();
        }
      });
    }
  };

  return (
    <Modal
      width={420}
      open={open}
      title={intl.get('DEVICE_UPGRADING')}
      okText={intl.get('UPGRADE')}
      onOk={onUpgrade}
      cancelText={intl.get('CANCEL')}
      onCancel={onCancel}
      confirmLoading={isLoading}
    >
      <Form form={form}>
        <Form.Item label={intl.get('SELECT_FIRMWARE_VERSION')} name={'firmware'}>
          <Select
            placeholder={intl.get('PLEASE_SELECT_FIRMWARE_VERSION')}
            onChange={(value) => {
              setFirmware(firmwares.find((item) => item.id === value));
            }}
          >
            {firmwares.map((firmware) => (
              <Option key={firmware.id} value={firmware.id}>
                {firmware.version}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
      {renderFirmware()}
    </Modal>
  );
};

export default UpgradeModal;
