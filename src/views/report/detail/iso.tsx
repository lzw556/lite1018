import React from 'react';
import iso1 from './iso-1.jpg';
import iso2 from './iso-2.jpg';
import iso3 from './iso-3.jpg';

export const ISO = () => {
  return (
    <>
      <section className='page iso'>
        <h3>三、 最新国际标准ISO-10816</h3>
        <div className='container'>
          <div className='item'>
            <p className='title'>ISO10816-3设备类型1-4 速度标准</p>
            <img src={iso1} alt='iso1' />
          </div>
        </div>
        <div className='container'>
          <div className='item'>
            <p className='title'>ISO10816-2大型汽轮发电机组 速度标准</p>
            <img src={iso2} alt='iso2' />
          </div>
        </div>
      </section>
      <section className='page iso'>
        <div className='container'>
          <div className='item' style={{ width: '90%' }}>
            <p className='title'>ISO10816-3设备类型1-4 位移标准</p>
            <img src={iso3} alt='iso3' style={{ width: '100%' }} />
          </div>
        </div>
      </section>
      <section className='page iso'>
        <p>ISO10816-3适用于功率大于1KW运行 转速120r/min或1500r/min的机组，例如</p>
        <ul className='text-list'>
          {[
            '功率小于50MW的汽轮机',
            '汽轮机组功率大于50MW转速低于1500r/min或高于3600r/min（ISO 10816-2以外的的机组）',
            '旋转式压缩机',
            '功率不大于3MW的工业燃气机轮',
            '离心式、混流式或轴流式泵',
            '除水力发电机组或泵站以外的发电机',
            '各种类型的电动机',
            '鼓风机或风机'
          ].map((p, i) => (
            <li key={i} className='item'>
              <div className='index'>{i + 1}、</div>
              <p className='desc'>{p}</p>
            </li>
          ))}
        </ul>
      </section>
      <section className='page iso'>
        <p style={{ marginBottom: 0, fontWeight: 700 }}>设备类型</p>
        <p>
          1组：额定功率大于300KW的大型机器；轴高大于等于315mm的电机。这类机器通常具有滑动轴承。运行或额定转速范围相对较款，从120rpm至15000rpm。
          <br />
          2组：中型机器其额定功率大于15KW，小于或等于300KW；轴高160mm&lt;=H&lt;315mm的电机。这类机器通常具有滚动轴承并运行转速超过600rpm。
          <br />
          3组：额定功率大于15KW多叶片叶轮并与原动机分开连接的泵（离心式、混流式或轴流式）。这组机器通常具有滑动轴承或滚动轴承。
          <br />
          4组：额定功率大于15KW多叶片叶轮并与原动机成一体（共轴）的泵（离心式、混流式或轴流式）。这组机器几乎都用滑动轴承或滚动轴承。
        </p>
      </section>
    </>
  );
};
