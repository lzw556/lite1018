package vo

import (
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"time"
)

type MeasurementRawData struct {
	Timestamp int64     `json:"timestamp"`
	Values    []float32 `json:"values,omitempty"`
}

func NewMeasurementRawData(e entity.LargeSensorData) MeasurementRawData {
	return MeasurementRawData{
		Timestamp: e.Time.Unix(),
	}
}

func (d MeasurementRawData) ToCsvFile() (*CsvFile, error) {
	filename := fmt.Sprintf("%s.csv", time.Unix(d.Timestamp, 0).Format("2006-01-02_15-04-05"))
	data := make([][]string, len(d.Values)/3)
	for i := 0; i < len(data); i++ {
		data[i] = []string{fmt.Sprintf("%f", d.Values[i]), fmt.Sprintf("%f", d.Values[i+1]), fmt.Sprintf("%f", d.Values[i+2])}
	}
	return &CsvFile{
		Name:  filename,
		Title: []string{"X", "Y", "Z"},
		Data:  data,
	}, nil
}

type MeasurementsRawData []MeasurementRawData

func (ms MeasurementsRawData) Len() int {
	return len(ms)
}

func (ms MeasurementsRawData) Less(i, j int) bool {
	return ms[i].Timestamp > ms[j].Timestamp
}

func (ms MeasurementsRawData) Swap(i, j int) {
	ms[i], ms[j] = ms[j], ms[i]
}
