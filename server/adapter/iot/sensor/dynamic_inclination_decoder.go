package sensor

import (
	"encoding/binary"
	"fmt"
	"github.com/mitchellh/mapstructure"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
	"math"
)

type DynamicInclinationDecoder struct{}

func NewDynamicInclinationDecoder() RawDataDecoder {
	return &DynamicInclinationDecoder{}
}

func (s DynamicInclinationDecoder) Decode(data []byte, metaLength int) (map[string]interface{}, error) {
	result := entity.SqRawData{}
	result.Metadata.Odr = binary.LittleEndian.Uint16(data[:2])
	result.Metadata.Number = binary.LittleEndian.Uint16(data[2:4])
	dataLength := binary.LittleEndian.Uint32(data[4:8])
	result.Metadata.MeanInclination = math.Float32frombits(binary.LittleEndian.Uint32(data[12:16]))
	result.Metadata.MeanPitch = math.Float32frombits(binary.LittleEndian.Uint32(data[16:20]))
	result.Metadata.MeanRoll = math.Float32frombits(binary.LittleEndian.Uint32(data[20:24]))
	result.Metadata.MeanWaggle = math.Float32frombits(binary.LittleEndian.Uint32(data[24:28]))

	xlog.Infof("receive metadata %s", fmt.Sprintf("%+v", result.Metadata))

	valueBytes := data[metaLength:]
	if int(dataLength) == len(valueBytes) {
		for i := 0; i < len(valueBytes); i += 16 {
			b := valueBytes[i : i+16]
			result.DynamicInclination = append(result.DynamicInclination, math.Float32frombits(binary.LittleEndian.Uint32(b[:4])))
			result.DynamicPitch = append(result.DynamicPitch, math.Float32frombits(binary.LittleEndian.Uint32(b[4:8])))
			result.DynamicRoll = append(result.DynamicRoll, math.Float32frombits(binary.LittleEndian.Uint32(b[8:12])))
			result.DynamicWaggle = append(result.DynamicWaggle, math.Float32frombits(binary.LittleEndian.Uint32(b[12:16])))
		}
		d := map[string]interface{}{}
		if err := mapstructure.Decode(result, &d); err != nil {
			return nil, err
		}
		return d, nil
	}
	return nil, fmt.Errorf("invalid data length data length = %d, receive length = %d", dataLength, len(valueBytes))
}
