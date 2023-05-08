import { InputNumber } from 'antd';
import React from 'react';
import intl from 'react-intl-universal';
import { FormInputItem } from '../../../components/formInputItem';
import { MonitoringPointTypeValue } from '../types';

export const AngleFieldsOfUpdate = ({ type }: { type: number }) => {
  return (
    <>
      <FormInputItem
        label={intl.get('TOWER_INSTALL_ANGLE')}
        name={['attributes', 'tower_install_angle']}
        requiredMessage={intl.get('PLEASE_ENTER_SOMETHING', {
          something: intl.get('TOWER_INSTALL_ANGLE')
        })}
        numericRule={{
          message: intl.get('VALIDATOR_NUMBER_RANGE', {
            name: intl.get('TOWER_INSTALL_ANGLE'),
            min: -180,
            max: 180
          }),
          min: -180,
          max: 180
        }}
        numericChildren={
          <InputNumber
            placeholder={intl.get('PLEASE_ENTER_SOMETHING', {
              something: intl.get('TOWER_INSTALL_ANGLE')
            })}
            style={{ width: '100%' }}
            controls={false}
            addonAfter='°'
          />
        }
      />
      {type === MonitoringPointTypeValue.TOWER_BASE_SETTLEMENT && (
        <FormInputItem
          label={intl.get('TOWER_BASE_RADIUS')}
          name={['attributes', 'tower_base_radius']}
          numericRule={{
            others: [
              {
                validator(_, value) {
                  if (value > 0) {
                    return Promise.resolve();
                  } else if (value == null) {
                    return Promise.reject(
                      new Error(
                        intl.get('PLEASE_ENTER_SOMETHING', {
                          something: intl.get('TOWER_BASE_RADIUS')
                        })
                      )
                    );
                  } else {
                    return Promise.reject(
                      new Error(
                        intl.get('VALIDATOR_NUMBER_MORE', {
                          name: intl.get('TOWER_BASE_RADIUS'),
                          min: 0
                        })
                      )
                    );
                  }
                }
              }
            ]
          }}
          numericChildren={
            <InputNumber
              placeholder={intl.get('PLEASE_ENTER_SOMETHING', {
                something: intl.get('TOWER_BASE_RADIUS')
              })}
              style={{ width: '100%' }}
              controls={false}
              addonAfter='m'
            />
          }
        />
      )}
      {type === MonitoringPointTypeValue.TOWER_INCLINATION && (
        <FormInputItem
          label={intl.get('TOWER_INSTALL_HEIGHT')}
          name={['attributes', 'tower_install_height']}
          numericRule={{
            others: [
              {
                validator(_, value) {
                  if (value > 0) {
                    return Promise.resolve();
                  } else if (value == null) {
                    return Promise.reject(
                      new Error(
                        intl.get('PLEASE_ENTER_SOMETHING', {
                          something: intl.get('TOWER_INSTALL_HEIGHT')
                        })
                      )
                    );
                  } else {
                    return Promise.reject(
                      new Error(
                        intl.get('VALIDATOR_NUMBER_MORE', {
                          name: intl.get('TOWER_INSTALL_HEIGHT'),
                          min: 0
                        })
                      )
                    );
                  }
                }
              }
            ]
          }}
          numericChildren={
            <InputNumber
              placeholder={intl.get('PLEASE_ENTER_SOMETHING', {
                something: intl.get('TOWER_INSTALL_HEIGHT')
              })}
              style={{ width: '100%' }}
              controls={false}
              addonAfter='m'
            />
          }
        />
      )}
    </>
  );
};
