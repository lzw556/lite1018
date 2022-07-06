package entity

import (
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
)

type SvtRawData struct {
	XAxis AxisSensorData `json:"xAxis" mapstructure:"xAxis"`
	YAxis AxisSensorData `json:"yAxis" mapstructure:"yAxis"`
	ZAxis AxisSensorData `json:"zAxis" mapstructure:"zAxis"`
}

func (s *SvtRawData) SetMetadata(i int, r uint8, o uint32, n uint32, scale uint32) {
	switch i {
	case 0:
		s.XAxis.Metadata.Range = r
		s.XAxis.Metadata.Odr = o
		s.XAxis.Metadata.Number = n
		s.XAxis.Metadata.FullScale = scale
	case 1:
		s.YAxis.Metadata.Range = r
		s.YAxis.Metadata.Odr = o
		s.YAxis.Metadata.Number = n
		s.XAxis.Metadata.FullScale = scale
	case 2:
		s.ZAxis.Metadata.Range = r
		s.ZAxis.Metadata.Odr = o
		s.ZAxis.Metadata.Number = n
		s.ZAxis.Metadata.FullScale = scale
	}
}

func (s *SvtRawData) SetValues(i int, values []float64) {
	switch i {
	case 0:
		s.XAxis.Values = values
	case 1:
		s.YAxis.Values = values
	case 2:
		s.ZAxis.Values = values
	}
}

func (s *SvtRawData) Values() ([]byte, error) {
	return json.Marshal(s)
}

func (s *SvtRawData) Name() string {
	return "SvtRawData"
}
