package monitoringpointtype

type DynamicPreload struct{}

func (DynamicPreload) ID() uint {
  return MonitoringPointTypeDynamicPreload
}

func (DynamicPreload) Properties() []Property {
  return []Property{
    {
      Key:       "preload",
      Name:      "预紧力",
      Unit:      "kN",
      Precision: 3,
      Sort:      0,
      Fields: []Field{
        {
          Name:      "预紧力",
          Key:       "preload",
          DataIndex: 5,
        },
      },
    },
    {
      Key:       "temperature",
      Name:      "温度",
      Unit:      "°C",
      Precision: 3,
      Sort:      1,
      Fields: []Field{
        {
          Name:      "温度",
          Key:       "temperature",
          DataIndex: 1,
        },
      },
    },
    {
      Key:       "length",
      Name:      "长度",
      Unit:      "mm",
      Precision: 3,
      Sort:      2,
      Fields: []Field{
        {
          Name:      "长度",
          Key:       "length",
          DataIndex: 0,
        },
      },
    },
    {
      Key:       "defect",
      Name:      "缺陷位置",
      Unit:      "mm",
      Precision: 3,
      Sort:      3,
      Fields: []Field{
        {
          Name:      "缺陷位置",
          Key:       "defect",
          DataIndex: 3,
        },
      },
    },
    {
      Key:       "tof",
      Name:      "飞行时间",
      Unit:      "ns",
      Precision: 3,
      Sort:      4,
      Fields: []Field{
        {
          Name:      "飞行时间",
          Key:       "tof",
          DataIndex: 2,
        },
      },
    },
    {
      Key:       "value",
      Name:      "信号强度",
      Unit:      "",
      Precision: 3,
      Sort:      5,
      Fields: []Field{
        {
          Name:      "信号强度",
          Key:       "value",
          DataIndex: 4,
        },
      },
    },
    {
      Key:       "dataCount",
      Name:      "采集数量",
      Unit:      "",
      Precision: 3,
      Sort:      6,
      Fields: []Field{
        {
          Name:      "采集数量",
          Key:       "dataCount",
          DataIndex: 7,
        },
      },
    },
  }
}
