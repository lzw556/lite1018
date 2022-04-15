package sensor

import (
	"bytes"
	"encoding/binary"
	"fmt"
	"github.com/mitchellh/mapstructure"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type Kx122Decoder struct{}

func NewKx122Decoder() RawDataDecoder {
	return &Kx122Decoder{}
}

func (s Kx122Decoder) Decode(data []byte) (map[string]interface{}, error) {
	// decode metadata
	metadata := [3]struct {
		dataType   uint8
		axis       uint8
		ranges     uint8
		odr        uint32
		number     uint32
		dataLength uint32
	}{}
	for i := range metadata {
		metaByte := data[i*24 : (i+1)*24]
		_ = binary.Read(bytes.NewBuffer(metaByte[:1]), binary.LittleEndian, &metadata[i].dataType)
		_ = binary.Read(bytes.NewBuffer(metaByte[1:2]), binary.LittleEndian, &metadata[i].axis)
		_ = binary.Read(bytes.NewBuffer(metaByte[2:3]), binary.LittleEndian, &metadata[i].ranges)
		_ = binary.Read(bytes.NewBuffer(metaByte[4:8]), binary.LittleEndian, &metadata[i].odr)
		_ = binary.Read(bytes.NewBuffer(metaByte[8:12]), binary.LittleEndian, &metadata[i].number)
		_ = binary.Read(bytes.NewBuffer(metaByte[12:16]), binary.LittleEndian, &metadata[i].dataLength)
	}

	// decode raw data
	totalLength := int(metadata[0].dataLength + metadata[1].dataLength + metadata[2].dataLength)
	valueBytes := data[72:]
	if len(valueBytes) == totalLength {
		svtRawData := entity.SvtRawData{}
		rawDataOffset := 0 //metadata length
		for i, m := range metadata {
			axisData := valueBytes[rawDataOffset : rawDataOffset+int(m.dataLength)]
			svtRawData.SetMetadata(i, m.ranges, m.odr, m.number)
			values := make([]float64, 0)
			j := 0
			for j < len(axisData) {
				var value int16
				_ = binary.Read(bytes.NewBuffer(axisData[j:j+2]), binary.LittleEndian, &value)
				values = append(values, float64(value))
				j += 2
			}
			svtRawData.SetValues(i, values)
			rawDataOffset += int(m.dataLength)
		}
		d := map[string]interface{}{}
		if err := mapstructure.Decode(svtRawData, &d); err != nil {
			return nil, err
		}
		return d, nil
	}
	return nil, fmt.Errorf("invalid data length data length = %d, receive length = %d", totalLength, len(valueBytes))
}
