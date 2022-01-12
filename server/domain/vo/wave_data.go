package vo

import (
	"fmt"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"time"
)

type WaveData struct {
	Frequency   float32     `json:"frequency"`
	Timestamp   int64       `json:"timestamp"`
	Values      [][]float64 `json:"values,omitempty"`
	Frequencies [][]int     `json:"frequencies,omitempty"`
	Times       [][]int     `json:"times,omitempty"`
}

func NewWaveData(e entity.LargeSensorData) WaveData {
	m := WaveData{
		Timestamp: e.Time.UTC().Unix(),
		Frequency: 256000,
	}
	if value, ok := e.Parameters["kx122_continuous_odr"]; ok {
		m.Frequency = cast.ToFloat32(value)
	}
	return m
}

func (m *WaveData) SetValues(values []float64) {
	m.Values = make([][]float64, 3)
	for i := 0; i < len(values); i++ {
		m.Values[i%len(m.Values)] = append(m.Values[i%len(m.Values)], values[i])
	}
}

func (d WaveData) ToCsvFile() (*CsvFile, error) {
	filename := fmt.Sprintf("%s.csv", time.Unix(d.Timestamp, 0).Format("2006-01-02_15-04-05"))
	data := make([][]string, len(d.Values[0]))
	for i := 0; i < len(data); i++ {
		axis := make([]string, len(d.Values))
		for j, value := range d.Values {
			axis[j] = fmt.Sprintf("%f", value[i])
		}
		data[i] = axis
	}
	return &CsvFile{
		Name:  filename,
		Title: []string{"X", "Y", "Z"},
		Data:  data,
	}, nil
}

type MeasurementsRawData []WaveData

func (ms MeasurementsRawData) Len() int {
	return len(ms)
}

func (ms MeasurementsRawData) Less(i, j int) bool {
	return ms[i].Timestamp > ms[j].Timestamp
}

func (ms MeasurementsRawData) Swap(i, j int) {
	ms[i], ms[j] = ms[j], ms[i]
}
