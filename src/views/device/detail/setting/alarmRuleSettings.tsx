import { Row, Col, Empty, Button, Spin } from 'antd';
import * as React from 'react';
import { PagingAlarmRuleRequest } from '../../../../apis/alarm';
import {
  AddAlarmRuleToDeviceRequest,
  PagingAlarmRuleDeviceRequest,
  RemoveAlarmRuleFromDeviceRequest
} from '../../../../apis/device';
import { Device } from '../../../../types/device';
import { PageResult } from '../../../../types/page';
import { AlarmRuleSelection } from './alarmRuleSelection';
import { FilterableAlarmRuleTable } from './filterableAlarmRuleTable';
import intl from 'react-intl-universal';

export const AlarmRuleSettings: React.FC<{ device: Device }> = ({ device }) => {
  const [crtRules, setCrtRules] = React.useState<any>([]);
  const [rules, setRules] = React.useState<{
    isLoaded: boolean;
    dataSource: PageResult<any[]>;
  }>({
    isLoaded: false,
    dataSource: {} as PageResult<[]>
  });
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [open, setVisible] = React.useState(false);
  const fetchCrtRules = React.useCallback(
    (current: number, size: number) => {
      PagingAlarmRuleDeviceRequest(device.id, current, size).then((res) => {
        setIsLoaded(true);
        setCrtRules(res);
      });
    },
    [device.id]
  );
  React.useEffect(() => {
    fetchCrtRules(1, 10);
  }, [fetchCrtRules]);
  const fetchAllRules = React.useCallback(
    (current: number, size: number, crtRules: any) => {
      PagingAlarmRuleRequest({ category: 1, source_type: device.typeId }, current, size).then(
        (res) => {
          let result = res.result;
          if (crtRules.length > 0)
            result = result.filter((rule) => !crtRules.find((r: any) => r.id === rule.id));
          setRules({
            dataSource: { ...res, result },
            isLoaded: true
          });
        }
      );
    },
    [device.typeId]
  );
  React.useEffect(() => {
    fetchAllRules(1, 10, crtRules);
  }, [crtRules, fetchAllRules]);

  const AddRules = (ids: number[]) => {
    AddAlarmRuleToDeviceRequest(device.id, ids).then((res: any) => {
      fetchCrtRules(1, 10);
    });
  };

  if (!isLoaded) return <Spin tip={intl.get('LOADING')} />;
  if (isLoaded && crtRules.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <>
            <p>
              {intl.get('NO_RULES_GO_PROMPT')}
              <a
                href='#!'
                onClick={(e) => {
                  setVisible(true);
                  e.preventDefault();
                }}
              >
                {intl.get('CREATE_ONE')}
              </a>
              {open && (
                <AlarmRuleSelection
                  {...rules}
                  fetchData={fetchAllRules}
                  open={open}
                  setVisible={setVisible}
                  onSelect={(ids) => AddRules(ids.map((id) => Number(id)))}
                />
              )}
            </p>
          </>
        }
      />
    );
  }
  if (isLoaded && crtRules.length > 0) {
    return (
      <>
        <Row style={{ marginBottom: 12 }}>
          <Col>
            <Button
              type='primary'
              onClick={() => {
                setVisible(true);
              }}
            >
              {intl.get('CREATE')}
            </Button>
          </Col>
        </Row>
        <FilterableAlarmRuleTable
          dataSource={crtRules}
          fetchData={fetchCrtRules}
          onRemove={(id) =>
            RemoveAlarmRuleFromDeviceRequest(device.id, [id]).then((res) => {
              fetchCrtRules(1, 10);
            })
          }
        />
        {open && (
          <AlarmRuleSelection
            {...rules}
            fetchData={fetchAllRules}
            open={open}
            setVisible={setVisible}
            onSelect={(ids) => AddRules(ids.map((id) => Number(id)))}
          />
        )}
      </>
    );
  }

  return null;
};
