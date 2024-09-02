import React from 'react';
import { useParams } from 'react-router-dom';
import { Button, Tabs } from 'antd';
import intl from 'react-intl-universal';
import './style.css';
import { Trend } from './trend';
import { TimeDomain } from './timeDomain';
import {
  AnalysisContext,
  useSubProps,
  useTrendProps,
  useOriginalDomainResult
} from './useAnalysis';
import { Cross } from './cross';
import { Frequency } from './frequency';
import { TimeEnvelope } from './timeEnvelope';
import { Envelope } from './envelope';
import { Power } from './power';
import { Zoom } from './zoom';
import { Cepstrum } from './cepstrum';
import { TimeFrequency } from './timeFrequency';
import { OriginalDomain } from './originalDomain';

export const subs = [
  { key: 'originalDomain', label: 'FIELD_ORIGINAL_DOMAIN', children: <OriginalDomain /> },
  { key: 'timeDomain', label: 'time.domain', children: <TimeDomain /> },
  { key: 'frequency', label: 'spectrum', children: <Frequency /> },
  { key: 'timeEnvelope', label: 'time.envelope', children: <TimeEnvelope /> },
  { key: 'envelope', label: 'envelope.spectrum', children: <Envelope /> },
  { key: 'power', label: 'power.spectrum', children: <Power /> },
  { key: 'cross', label: 'cross.spectrum', children: <Cross /> },
  { key: 'zoom', label: 'zoom.fft', children: <Zoom /> },
  { key: 'cepstrum', label: 'cepstrum', children: <Cepstrum /> },
  { key: 'timeFrequency', label: 'stft', children: <TimeFrequency /> }
];

export const VibrationAnalysis = () => {
  const [activeKey, setActiveKey] = React.useState('originalDomain');
  const { id } = useParams();

  return (
    <AnalysisProvider id={Number(id)} activeKey={activeKey}>
      <Tabs
        activeKey={activeKey}
        id='vibration-analysis'
        onChange={setActiveKey}
        items={subs.map(({ key, label, children }) => ({
          label: (
            <Button shape='round' type={activeKey === key ? 'primary' : 'default'} size='small'>
              {intl.get(label)}
            </Button>
          ),
          key,
          children: (
            <>
              <Trend />
              {children}
            </>
          )
        }))}
        tabPosition='left'
        tabBarGutter={0}
      />
    </AnalysisProvider>
  );
};

function AnalysisProvider({
  children,
  id,
  activeKey
}: {
  children: React.ReactNode;
  id: number;
  activeKey: string;
}) {
  return (
    <AnalysisContext.Provider
      value={{
        activeKey,
        ...useTrendProps(id),
        ...useSubProps(),
        ...useOriginalDomainResult()
      }}
      key={id}
    >
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysisContext() {
  return React.useContext(AnalysisContext);
}
