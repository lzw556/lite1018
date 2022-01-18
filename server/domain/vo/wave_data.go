package vo

import (
	"fmt"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/calculate"
	"strconv"
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
		Frequency: 25600,
	}
	if value, ok := e.Parameters["kx122_continuous_odr"]; ok {
		m.Frequency = cast.ToFloat32(value)
	}
	return m
}

func (d *WaveData) SetTimeDomainValues(index int, values []float64) {
	d.Times[index] = make([]int, len(values))
	d.Values[index] = make([]float64, len(values))
	for i, value := range values {
		d.Times[index][i] = int((float32(i+1) / d.Frequency) * 1000)
		d.Values[index][i], _ = strconv.ParseFloat(fmt.Sprintf("%.3f", value), 64)
	}
}

func (d *WaveData) SetFrequencyDomainValues(index int, fftValues []calculate.FFTOutput) {
	d.Times[index] = make([]int, len(fftValues))
	d.Values[index] = make([]float64, len(fftValues))
	for i, output := range fftValues {
		d.Values[index][i], _ = strconv.ParseFloat(fmt.Sprintf("%.3f", output.FFTValue), 64)
		d.Frequencies[index][i] = int(output.Frequency)
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
