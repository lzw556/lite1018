package sensor

import (
	"encoding/binary"
	"fmt"
	"github.com/mitchellh/mapstructure"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"math"
)

type DynamicLengthAttitudeDecoder struct {
}

func NewDynamicLengthAttitudeDecoder() RawDataDecoder {
	return &DynamicLengthAttitudeDecoder{}
}

func (s DynamicLengthAttitudeDecoder) Decode(data []byte, metaLength int) (map[string]interface{}, error) {
	result := entity.SasRawData{}
	var dataLength = binary.LittleEndian.Uint32(data[4:8])
	result.Metadata.Odr = binary.LittleEndian.Uint16(data[:2])
	result.Metadata.Number = binary.LittleEndian.Uint16(data[2:4])
	result.Metadata.Temperature = math.Float32frombits(binary.LittleEndian.Uint32(data[12:16]))
	result.Metadata.DefectLocation = math.Float32frombits(binary.LittleEndian.Uint32(data[16:20]))
	result.Metadata.DefectGrade = math.Float32frombits(binary.LittleEndian.Uint32(data[20:24]))
	result.Metadata.Value = math.Float32frombits(binary.LittleEndian.Uint32(data[24:28]))
	result.Metadata.DataCount = math.Float32frombits(binary.LittleEndian.Uint32(data[28:32]))
	result.Metadata.MinLength = math.Float32frombits(binary.LittleEndian.Uint32(data[32:36]))
	result.Metadata.MinTof = math.Float32frombits(binary.LittleEndian.Uint32(data[36:40]))
	result.Metadata.MinPreload = math.Float32frombits(binary.LittleEndian.Uint32(data[40:44]))
	result.Metadata.MinIntensityPressure = math.Float32frombits(binary.LittleEndian.Uint32(data[44:48]))
	result.Metadata.MinAcceleration.XAxis = math.Float32frombits(binary.LittleEndian.Uint32(data[48:52]))
	result.Metadata.MinAcceleration.YAxis = math.Float32frombits(binary.LittleEndian.Uint32(data[52:56]))
	result.Metadata.MinAcceleration.ZAxis = math.Float32frombits(binary.LittleEndian.Uint32(data[56:60]))
	result.Metadata.MaxLength = math.Float32frombits(binary.LittleEndian.Uint32(data[60:64]))
	result.Metadata.MaxTof = math.Float32frombits(binary.LittleEndian.Uint32(data[64:68]))
	result.Metadata.MaxPreload = math.Float32frombits(binary.LittleEndian.Uint32(data[68:72]))
	result.Metadata.MaxIntensityPressure = math.Float32frombits(binary.LittleEndian.Uint32(data[72:76]))
	result.Metadata.MaxAcceleration.XAxis = math.Float32frombits(binary.LittleEndian.Uint32(data[76:80]))
	result.Metadata.MaxAcceleration.YAxis = math.Float32frombits(binary.LittleEndian.Uint32(data[80:84]))
	result.Metadata.MaxAcceleration.ZAxis = math.Float32frombits(binary.LittleEndian.Uint32(data[84:88]))

	valueBytes := data[metaLength:]
	if int(dataLength) == len(valueBytes) {
		for i := 0; i < len(valueBytes); i += 28 {
			b := valueBytes[i : i+28]
			var (
				length       = math.Float32frombits(binary.LittleEndian.Uint32(b[0:4]))
				tof          = math.Float32frombits(binary.LittleEndian.Uint32(b[4:8]))
				preload      = math.Float32frombits(binary.LittleEndian.Uint32(b[8:12]))
				pressure     = math.Float32frombits(binary.LittleEndian.Uint32(b[12:16]))
				acceleration = entity.Acceleration{
					XAxis: math.Float32frombits(binary.LittleEndian.Uint32(b[16:20])),
					YAxis: math.Float32frombits(binary.LittleEndian.Uint32(b[20:24])),
					ZAxis: math.Float32frombits(binary.LittleEndian.Uint32(b[24:28])),
				}
			)
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
