package vo

import (
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"strconv"
	"time"
)

type KxData struct {
	Frequency     uint32    `json:"frequency"`
	Values        []float64 `json:"values,omitempty"`
	XAxis         []float64 `json:"xAxis,omitempty"`
	HighEnvelopes []float64 `json:"highEnvelopes,omitempty"`
	LowEnvelopes  []float64 `json:"lowEnvelopes,omitempty"`
	XAxisUnit     string    `json:"xAxisUnit"`
}

func NewKxData(axis entity.AxisSensorData) KxData {
	m := KxData{
		Frequency: axis.Metadata.Odr,
	}
	return m
}

func (data *KxData) SetFrequencyDomainValues(values [][2]float64) {
	data.Values = make([]float64, len(values))
	data.XAxis = make([]float64, len(values))
	data.XAxisUnit = "Hz"
	for i, value := range values {
		data.Values[i], _ = strconv.ParseFloat(fmt.Sprintf("%.3f", value[0]), 64)
		data.XAxis[i] = value[1]
	}
}

func (data *KxData) SetTimeDomainValues(values []float64) {
	data.Values = make([]float64, len(values))
	data.XAxis = make([]float64, len(values))
	data.XAxisUnit = "ms"
	for i := range values {
		data.Values[i], _ = strconv.ParseFloat(fmt.Sprintf("%.3f", values[i]), 64)
		data.XAxis[i] = float64(i+1) / float64(data.Frequency) * 1000
	}
}

func (data *KxData) SetEnvelopeValues(high, low []float64) {
	data.HighEnvelopes = make([]float64, len(high))
	data.LowEnvelopes = make([]float64, len(low))
	for i := range high {
		data.HighEnvelopes[i], _ = strconv.ParseFloat(fmt.Sprintf("%.3f", high[i]), 64)
		data.LowEnvelopes[i], _ = strconv.ParseFloat(fmt.Sprintf("%.3f", low[i]), 64)
	}
}

type WaveDataList []KxData

func (list WaveDataList) ToCsvFile() (*CsvFile, error) {
	filename := fmt.Sprintf("%s.csv", time.Now().Format("2006-01-02_15-04-05"))
	data := make([][]string, len(list))
	max := 0
	for _, kxData := range list {
		fmt.Println(len(kxData.Values))
		if max <= len(kxData.Values) {
			max = len(kxData.Values)
		}
	}
	fmt.Println(max)
	for i := 0; i < max; i++ {
		cell := make([]string, len(list))
		for j, kxData := range list {
			if i < len(kxData.Values) {
				cell[j] = fmt.Sprintf("%f", kxData.Values[i])
			}
		}
		data = append(data, cell)
	}
	return &CsvFile{
		Name: filename,
		Data: data,
	}, nil
}
