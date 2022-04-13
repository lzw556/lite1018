package sensor

import (
	"bytes"
	"encoding/binary"
	"fmt"
	"github.com/mitchellh/mapstructure"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type DynamicInclinationDecoder struct{}

func NewDynamicInclinationDecoder() RawDataDecoder {
	return &DynamicInclinationDecoder{}
}

func (s DynamicInclinationDecoder) Decode(data []byte) (map[string]interface{}, error) {
	result := entity.SqRawData{}
	var dataLength uint32
	_ = binary.Read(bytes.NewReader(data[:2]), binary.LittleEndian, &result.Metadata.Odr)
	_ = binary.Read(bytes.NewReader(data[2:4]), binary.LittleEndian, &result.Metadata.Number)
	_ = binary.Read(bytes.NewReader(data[4:8]), binary.LittleEndian, &dataLength)
	_ = binary.Read(bytes.NewReader(data[12:16]), binary.LittleEndian, &result.Metadata.MeanInclination)
	_ = binary.Read(bytes.NewReader(data[16:20]), binary.LittleEndian, &result.Metadata.MeanPitch)
	_ = binary.Read(bytes.NewReader(data[20:24]), binary.LittleEndian, &result.Metadata.MeanRoll)

	valueBytes := data[24:]
	if int(dataLength) == len(valueBytes) {
		for i := 0; i < len(valueBytes); i += 12 {
			b := valueBytes[i : i+12]
			var (
				inclination float32
				pitch       float32
				roll        float32
			)
			_ = binary.Read(bytes.NewReader(b[:4]), binary.LittleEndian, &inclination)
			_ = binary.Read(bytes.NewReader(b[4:8]), binary.LittleEndian, &pitch)
			_ = binary.Read(bytes.NewReader(b[8:12]), binary.LittleEndian, &roll)
			result.DynamicInclination = append(result.DynamicInclination, inclination)
			result.DynamicPitch = append(result.DynamicPitch, pitch)
			result.DynamicRoll = append(result.DynamicRoll, roll)
		}
		d := map[string]interface{}{}
		if err := mapstructure.Decode(result, &d); err != nil {
			return nil, err
		}
		return d, nil
	}
	return nil, fmt.Errorf("invalid data length data length = %d, receive length = %d", dataLength, len(valueBytes))
}
