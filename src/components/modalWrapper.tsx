import { Modal, ModalProps } from 'antd';
import React from 'react';

export const ModalWrapper = (props: ModalProps) => {
  return <Modal {...props} bodyStyle={{ maxHeight: 600, overflow: 'auto' }} />;
};
