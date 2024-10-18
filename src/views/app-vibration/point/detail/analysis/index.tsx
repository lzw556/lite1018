import React from 'react';
import { Button, Divider, Tabs } from 'antd';
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
import { downloadRawHistory } from '../../../../asset-common';
import { getFilename } from '../../../../../utils/format';
import { useLocaleContext } from '../../../../../localeProvider';

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

export const Analysis = ({ id }: { id: number }) => {
  const [activeKey, setActiveKey] = React.useState('originalDomain');

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
        tabBarExtraContent={{
          left: <DownloadButton id={id} />
        }}
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
      // key={id}
    >
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysisContext() {
  return React.useContext(AnalysisContext);
}

function DownloadButton({ id }: { id: number }) {
  const { language } = useLocaleContext();
  const { timestamps, sub } = useAnalysisContext();
  const { axies, subProperties } = sub;
  const timestamp = timestamps.find((t) => t.selected);
  let filters: any;
  const axis = axies.find((a) => a.selected);
  const field = subProperties.find((p) => p.selected);
  if (axis && field) {
    filters = { axis: axis.value, field: field.value };
  }
  if (timestamp) {
    return (
      <>
        <Button
          shape='round'
          size='small'
          style={{ marginRight: 18 }}
          onClick={() => {
            // downloadRawHistory(
            //   id,
            //   timestamp.value,
            //   language === 'en-US' ? 'en' : 'zh',
            //   'raw',
            //   filters
            // ).then((res) => {
            //   const url = window.URL.createObjectURL(new Blob([res.data]));
            //   const link = document.createElement('a');
            //   link.href = url;
            //   link.setAttribute('download', getFilename(res));
            //   document.body.appendChild(link);
            //   link.click();
            // });
          }}
        >
          {intl.get('DOWNLOAD_DATA')}
        </Button>
        <Divider style={{ margin: '16px 0 8px 0' }} />
      </>
    );
  } else {
    return null;
  }
}
