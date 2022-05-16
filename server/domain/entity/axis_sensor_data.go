package entity

import "github.com/thetasensors/theta-cloud-lite/server/pkg/calculate"

type AxisSensorData struct {
	Metadata struct {
		Range  uint8  `json:"range" mapstructure:"range"`
		Odr    uint32 `json:"odr" mapstructure:"odr"`
		Number uint32 `json:"number" mapstructure:"number"`
	} `json:"metadata" mapstructure:"metadata"`
	Values []float64 `json:"values" mapstructure:"values"`
}

func (axis AxisSensorData) AccelerationTimeDomain() []float64 {
	return calculate.AccelerationCalc(axis.Values, len(axis.Values), int(axis.Metadata.Odr), int(axis.Metadata.Range))
}

func (axis AxisSensorData) AccelerationFrequencyDomain() [][2]float64 {
	return calculate.AccelerationFrequencyCalc(axis.Values, len(axis.Values), int(axis.Metadata.Odr), int(axis.Metadata.Range))
}

func (axis AxisSensorData) VelocityTimeDomain() []float64 {
	return calculate.VelocityCalc(axis.Values, len(axis.Values), int(axis.Metadata.Odr), int(axis.Metadata.Range))
}

func (axis AxisSensorData) VelocityFrequencyDomain() [][2]float64 {
	return calculate.VelocityFrequencyCalc(axis.Values, len(axis.Values), int(axis.Metadata.Odr), int(axis.Metadata.Range))
}

func (axis AxisSensorData) VelocityEnvelope() [2][]float64 {
	highEnvelope, lowEnvelope := calculate.EnvelopCalc(axis.DisplacementTimeDomain())
	return [2][]float64{highEnvelope, lowEnvelope}
}

func (axis AxisSensorData) DisplacementTimeDomain() []float64 {
	return calculate.DisplacementCalc(axis.Values, len(axis.Values), int(axis.Metadata.Odr), int(axis.Metadata.Range))
}

func (axis AxisSensorData) DisplacementFrequencyDomain() [][2]float64 {
	return calculate.DisplacementFrequencyCalc(axis.Values, len(axis.Values), int(axis.Metadata.Odr), int(axis.Metadata.Range))
}

func (axis AxisSensorData) Envelope(raw []float64) ([]float64, []float64) {
	return calculate.EnvelopCalc(raw)
}
