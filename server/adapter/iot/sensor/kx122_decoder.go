package sensor

import (
	"encoding/binary"
	"fmt"
	"github.com/mitchellh/mapstructure"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"math"
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
		offset     float32
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
		metadata[i].offset = math.Float32frombits(binary.LittleEndian.Uint32(metadataBytes[offset+20 : offset+24]))
		offset += 24
	}

	fmt.Println(fmt.Sprintf("%+v", metadata))

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
				svtRawData.SetValues(int(m.axis), decodeInt16(axisData, m.offset))
			case 6: // uint24
				svtRawData.SetValues(int(m.axis), decodeUint24(axisData, m.offset))
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

func decodeInt16(data []byte, offset float32) []float64 {
	j := 0
	values := make([]float64, 0)
	for j < len(data) {
		var value = int16(binary.LittleEndian.Uint16(data[j : j+2]))
		values = append(values, float64(value)-float64(offset))
		j += 2
	}
	return values
}

func decodeUint24(data []byte, offset float32) []float64 {
	values := make([]float64, 0)
	for i := 0; i < len(data); i++ {
		if i%3 == 0 {
			v := make([]byte, 3)
			copy(v, data[i:i+3])
			value := int32(binary.LittleEndian.Uint32(append(v, 0)))
			values = append(values, float64(value)-float64(offset))
		}
	}
	return values
}
