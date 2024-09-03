import { Modal, ModalProps } from 'antd';
import React from 'react';

export const ModalWrapper = (props: ModalProps) => {
  return (
    <Modal
      {...props}
      styles={{ body: { maxHeight: 600, overflowY: 'auto', overflowX: 'hidden' } }}
    />
  );
};
