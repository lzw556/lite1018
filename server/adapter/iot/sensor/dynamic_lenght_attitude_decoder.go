package sensor

import (
	"bytes"
	"encoding/binary"
	"fmt"
	"github.com/mitchellh/mapstructure"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type DynamicLengthAttitudeDecoder struct {
}

func NewDynamicLengthAttitudeDecoder() RawDataDecoder {
	return &DynamicLengthAttitudeDecoder{}
}

func (s DynamicLengthAttitudeDecoder) Decode(data []byte) (map[string]interface{}, error) {
	result := entity.SasRawData{}
	var dataLength uint32
	_ = binary.Read(bytes.NewBuffer(data[:2]), binary.LittleEndian, &result.Metadata.Odr)
	_ = binary.Read(bytes.NewBuffer(data[2:4]), binary.LittleEndian, &result.Metadata.Number)
	_ = binary.Read(bytes.NewBuffer(data[4:8]), binary.LittleEndian, &dataLength)
	//_ = binary.Read(bytes.NewBuffer(data[8:12]), binary.LittleEndian, &result.Metadata.Time)
	_ = binary.Read(bytes.NewBuffer(data[12:16]), binary.LittleEndian, &result.Metadata.Temperature)
	_ = binary.Read(bytes.NewBuffer(data[16:20]), binary.LittleEndian, &result.Metadata.DefectLocation)
	_ = binary.Read(bytes.NewBuffer(data[20:24]), binary.LittleEndian, &result.Metadata.DefectGrade)
	_ = binary.Read(bytes.NewBuffer(data[24:28]), binary.LittleEndian, &result.Metadata.Value)
	_ = binary.Read(bytes.NewBuffer(data[28:32]), binary.LittleEndian, &result.Metadata.DataCount)

	_ = binary.Read(bytes.NewBuffer(data[32:36]), binary.LittleEndian, &result.Metadata.MinLength)
	_ = binary.Read(bytes.NewBuffer(data[36:40]), binary.LittleEndian, &result.Metadata.MinTof)
	_ = binary.Read(bytes.NewBuffer(data[40:44]), binary.LittleEndian, &result.Metadata.MinPreload)
	_ = binary.Read(bytes.NewBuffer(data[44:48]), binary.LittleEndian, &result.Metadata.MinIntensityPressure)
	_ = binary.Read(bytes.NewBuffer(data[48:52]), binary.LittleEndian, &result.Metadata.MaxLength)
	_ = binary.Read(bytes.NewBuffer(data[52:56]), binary.LittleEndian, &result.Metadata.MaxTof)
	_ = binary.Read(bytes.NewBuffer(data[56:60]), binary.LittleEndian, &result.Metadata.MaxPreload)
	_ = binary.Read(bytes.NewBuffer(data[60:64]), binary.LittleEndian, &result.Metadata.MaxIntensityPressure)

	valueBytes := data[88:]
	if int(dataLength) == len(valueBytes) {
		for i := 0; i < len(valueBytes); i += 28 {
			b := valueBytes[i : i+28]
			var (
				length       float32
				tof          float32
				preload      float32
				pressure     float32
				acceleration entity.DynamicAcceleration
			)
			_ = binary.Read(bytes.NewBuffer(b[0:4]), binary.LittleEndian, &length)
			_ = binary.Read(bytes.NewBuffer(b[4:8]), binary.LittleEndian, &tof)
			_ = binary.Read(bytes.NewBuffer(b[8:12]), binary.LittleEndian, &preload)
			_ = binary.Read(bytes.NewBuffer(b[12:16]), binary.LittleEndian, &pressure)
			_ = binary.Read(bytes.NewBuffer(b[16:20]), binary.LittleEndian, &acceleration.XAxis)
			_ = binary.Read(bytes.NewBuffer(b[20:24]), binary.LittleEndian, &acceleration.YAxis)
			_ = binary.Read(bytes.NewBuffer(b[24:28]), binary.LittleEndian, &acceleration.ZAxis)
			result.DynamicLength = append(result.DynamicLength, length)
			result.DynamicTof = append(result.DynamicTof, tof)
			result.DynamicPreload = append(result.DynamicPreload, preload)
			result.DynamicPressure = append(result.DynamicPressure, pressure)
			result.DynamicAcceleration = append(result.DynamicAcceleration, acceleration)
		}
		d := map[string]interface{}{}
		if err := mapstructure.Decode(result, &d); err != nil {
			return nil, err
		}
		return d, nil
	}
	return nil, fmt.Errorf("invalid data length data length = %d, receive length = %d", dataLength, len(valueBytes))
}
