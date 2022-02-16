package vo

import (
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"strconv"
	"time"
)

type WaveData struct {
	Frequency     uint32    `json:"frequency"`
	Values        []float64 `json:"values,omitempty"`
	XAxis         []int     `json:"xAxis,omitempty"`
	HighEnvelopes []float64 `json:"highEnvelopes,omitempty"`
	LowEnvelopes  []float64 `json:"lowEnvelopes,omitempty"`
	XAxisUnit     string    `json:"xAxisUnit"`
}

func NewWaveData(axis entity.AxisSensorData) WaveData {
	m := WaveData{
		Frequency: axis.Metadata.Odr,
	}
	return m
}

func (data *WaveData) SetFrequencyDomainValues(values [][2]float64) {
	data.Values = make([]float64, len(values))
	data.XAxis = make([]int, len(values))
	data.XAxisUnit = "Hz"
	for i, value := range values {
		data.Values[i], _ = strconv.ParseFloat(fmt.Sprintf("%.3f", value[0]), 64)
		data.XAxis[i] = int(value[1])
	}
}

func (data *WaveData) SetTimeDomainValues(values []float64) {
	data.Values = make([]float64, len(values))
	data.XAxis = make([]int, len(values))
	data.XAxisUnit = "ms"
	for i := range values {
		data.Values[i], _ = strconv.ParseFloat(fmt.Sprintf("%.3f", values[i]), 64)
		data.XAxis[i] = int(float32(i+1) / float32(data.Frequency) * 1000)
	}
}

func (data *WaveData) SetEnvelopeValues(high, low []float64) {
	data.HighEnvelopes = make([]float64, len(high))
	data.LowEnvelopes = make([]float64, len(low))
	for i := range high {
		data.HighEnvelopes[i], _ = strconv.ParseFloat(fmt.Sprintf("%.3f", high[i]), 64)
		data.LowEnvelopes[i], _ = strconv.ParseFloat(fmt.Sprintf("%.3f", low[i]), 64)
	}
}

type WaveDataList []WaveData

func (list WaveDataList) ToCsvFile() (*CsvFile, error) {
	filename := fmt.Sprintf("%s.csv", time.Now().Format("2006-01-02_15-04-05"))
	data := make([][]string, 0)
	if len(list) > 0 {
		for i := range list[0].Values {
			cell := make([]string, len(list))
			for j := range list {
				cell[j] = fmt.Sprintf("%f", list[j].Values[i])
			}
			data = append(data, cell)
		}
	}
	return &CsvFile{
		Name: filename,
		Data: data,
	}, nil
}
