package sensor

import (
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
	metadata := make([]struct {
		dataType   uint8
		axis       uint8
		ranges     uint8
		odr        uint32
		number     uint32
		dataLength uint32
	}, 3)
	metadataBytes := data[:72]
	offset := 0
	for i := range metadata {
		metadata[i].dataType = metadataBytes[offset]
		metadata[i].axis = metadataBytes[offset+1]
		metadata[i].ranges = metadataBytes[offset+2]
		metadata[i].odr = binary.LittleEndian.Uint32(metadataBytes[offset+4 : offset+8])
		metadata[i].number = binary.LittleEndian.Uint32(metadataBytes[offset+8 : offset+12])
		metadata[i].dataLength = binary.LittleEndian.Uint32(metadataBytes[offset+12 : offset+16])
		offset += 24
	}

	// decode raw data
	totalLength := int(metadata[0].dataLength + metadata[1].dataLength + metadata[2].dataLength)
	valueBytes := data[72:]
	if len(valueBytes) == totalLength {
		svtRawData := entity.SvtRawData{}
		rawDataOffset := 0 //metadata length
		for _, m := range metadata {
			axisData := valueBytes[rawDataOffset : rawDataOffset+int(m.dataLength)]
			svtRawData.SetMetadata(int(m.axis), m.ranges, m.odr, m.number)
			switch m.dataType {
			case 3: // int16
				svtRawData.SetValues(int(m.axis), decodeInt16(axisData))
			case 6: // uint24
				svtRawData.SetValues(int(m.axis), decodeUint24(axisData))
			}
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

func decodeInt16(data []byte) []float64 {
	j := 0
	values := make([]float64, 0)
	for j < len(data) {
		var value = int16(binary.LittleEndian.Uint16(data[j : j+2]))
		values = append(values, float64(value))
		j += 2
	}
	return values
}

func decodeUint24(data []byte) []float64 {
	j := 0
	values := make([]float64, 0)
	for j < len(data) {
		fmt.Println(append(data[j:j+3], 0))
		value := int32(binary.LittleEndian.Uint32(append(data[j:j+3], 0)))
		fmt.Println(value)
		values = append(values, float64(value-131072))
		j += 3
	}
	return values
}
