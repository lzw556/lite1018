package entity

import (
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
)

type SvtRawData struct {
	XAxis AxisSensorData `json:"xAxis"`
	YAxis AxisSensorData `json:"yAxis"`
	ZAxis AxisSensorData `json:"zAxis"`
}

func (s *SvtRawData) SetMetadata(i int, r uint8, o uint32, n uint32) {
	switch i {
	case 0:
		s.XAxis.Metadata.Range = r
		s.XAxis.Metadata.Odr = o
		s.XAxis.Metadata.Number = n
	case 1:
		s.YAxis.Metadata.Range = r
		s.YAxis.Metadata.Odr = o
		s.YAxis.Metadata.Number = n
	case 2:
		s.ZAxis.Metadata.Range = r
		s.ZAxis.Metadata.Odr = o
		s.ZAxis.Metadata.Number = n
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
