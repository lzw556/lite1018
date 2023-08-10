import React from 'react';
import { Button } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { AlarmPage } from './alarm';
import * as Types from './report';
import { Status } from './status';
import { A4_HEIGHT, A4_SIZE, PAGE_GAP, REPORT } from './report';
import dayjs from '../../../utils/dayjsUtils';
import Cover from './cover.jpg';
import './style.css';
import { useLocation } from 'react-router-dom';
import { duration } from 'dayjs';

export default function Report() {
  const { state } = useLocation();
  const report = state;
  const reportRef = React.useRef<HTMLDivElement>(null);
  const [loading, setLoading] = React.useState(false);
  const duration = `${dayjs.unix(report.start).local().format('YYYY-MM-DD')}-${dayjs
    .unix(report.end)
    .local()
    .format('YYYY-MM-DD')}`;

  const renderCover = () => {
    return (
      <section className='page'>
        <img src={Cover} alt='cover' style={{ width: '100%' }} />
        <div style={{ height: 48 }}></div>
        <h1 className='title'>{REPORT.title}</h1>
        <h3 className='title'>{REPORT.subTitle}</h3>
        <div style={{ height: 48 }}></div>
        <div style={{ height: 48 }}></div>
        <section className='center-container'>
          <p>
            项目名称：{report.reportName}
            <br />
            报告周期：{duration}
            <br />
            报告日期：{dayjs.unix(report.reportDate).local().format('YYYY-MM-DD')}
          </p>
        </section>
      </section>
    );
  };

  const renderPreface = () => {
    return (
      <section className='page'>
        <h2 className='title'>{REPORT.preface.title}</h2>
        <div style={{ height: 48 }}></div>
        <ul style={{ listStyle: 'none' }}>
          {REPORT.preface.items.map((p, i) => (
            <li key={i} style={{ display: 'flex' }}>
              <div style={{ width: '2em', flexShrink: 0 }}>{i + 1}.</div>
              <p style={{ marginBottom: 0 }}>{p}</p>
            </li>
          ))}
        </ul>
      </section>
    );
  };

  return (
    <div>
      <div className='report' ref={reportRef}>
        <Button
          data-html2canvas-ignore='true'
          loading={loading}
          onClick={() => {
            if (reportRef?.current) {
              const canvas = document.createElement('canvas');
              const dpi = devicePixelRatio > 1 ? devicePixelRatio : 1;
              const width = reportRef?.current.clientWidth;
              const height = reportRef?.current.clientHeight;
              canvas.width = dpi * width;
              canvas.height = dpi * height;
              canvas.style.width = width + 'px';
              canvas.style.height = height + 'px';
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.scale(dpi, dpi);
              }
              setLoading(true);
              html2canvas(reportRef.current, { canvas }).then((canvas) => {
                const doc = new jsPDF('p', 'mm', 'a4', true);
                const ctx = canvas.getContext('2d');
                const pages = Math.round(canvas.height / A4_HEIGHT);
                for (let index = 0; index < pages; index++) {
                  const page = document.createElement('canvas');
                  console.log('canvas', canvas);
                  page.width = canvas.width;
                  page.height = A4_HEIGHT;
                  page
                    .getContext('2d')
                    ?.putImageData(
                      ctx?.getImageData(
                        0,
                        index * (A4_HEIGHT + PAGE_GAP),
                        canvas.width,
                        A4_HEIGHT
                      )!,
                      0,
                      0
                    );

                  if (index > 0) {
                    doc.addPage();
                    doc.addImage(
                      page.toDataURL('image/jpeg'),
                      'JPEG',
                      0,
                      0,
                      A4_SIZE.width,
                      A4_SIZE.height
                    );
                  } else {
                    doc.addImage(
                      page.toDataURL('image/jpeg'),
                      'JPEG',
                      0,
                      0,
                      A4_SIZE.width,
                      A4_SIZE.height
                    );
                  }
                }
                doc.save(report.reportName + duration);
                setLoading(false);
              });
            }
          }}
          style={{ position: 'fixed', zIndex: 2 }}
          type='text'
        >
          <ExportOutlined />
        </Button>
        {renderCover()}
        {renderPreface()}
        <Status report={report} />
        <AlarmPage report={report} />
      </div>
    </div>
  );
}
